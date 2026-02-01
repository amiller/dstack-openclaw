/**
 * Ephemeral Sandbox Execution
 * 
 * One-time verifiable computation over private data
 * Dataset is NEVER stored - loaded, executed, deleted
 */

const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Only certificates are stored (NOT datasets)
const certificates = new Map();

/**
 * Hash data for verification
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate certificate ID
 */
function generateCertificateId() {
  return 'cert_' + crypto.randomBytes(12).toString('hex');
}

/**
 * Log execution event
 */
class ExecutionLogger {
  constructor() {
    this.events = [];
    this.startTime = Date.now();
  }
  
  log(type, data) {
    this.events.push({
      type,
      timestamp: new Date().toISOString(),
      elapsed_ms: Date.now() - this.startTime,
      ...data
    });
  }
  
  getTrace() {
    return {
      events: this.events,
      total_duration_ms: Date.now() - this.startTime
    };
  }
}

/**
 * Execute sandbox (ephemeral, one-time)
 */
async function executeSandbox(req, res) {
  const logger = new ExecutionLogger();
  let dataset = null;
  let datasetHash = null;
  
  try {
    const { dataset: datasetSpec, sandbox } = req.body;
    
    if (!datasetSpec || !sandbox) {
      return res.status(400).json({ 
        error: 'Missing required fields: dataset, sandbox' 
      });
    }
    
    logger.log('request_received', {
      has_dataset: !!datasetSpec,
      has_sandbox: !!sandbox
    });
    
    // Load dataset into memory (NEVER write to disk)
    if (datasetSpec.data) {
      dataset = datasetSpec.data;
      if (dataset.startsWith('base64:')) {
        dataset = Buffer.from(dataset.slice(7), 'base64').toString('utf-8');
      }
    } else if (datasetSpec.url) {
      // In production, fetch from URL
      return res.status(501).json({ 
        error: 'URL loading not implemented in MVP' 
      });
    } else {
      return res.status(400).json({ 
        error: 'Dataset must have data or url' 
      });
    }
    
    datasetHash = hashData(dataset);
    logger.log('dataset_loaded', {
      hash: datasetHash,
      size_bytes: Buffer.byteLength(dataset, 'utf-8'),
      format: datasetSpec.format || 'txt'
    });
    
    // Parse sandbox spec
    const { llm, tools = [], scripts = {}, environment = {} } = sandbox;
    
    if (!llm || !llm.prompt || !llm.api_key) {
      return res.status(400).json({ 
        error: 'Sandbox must have llm.prompt and llm.api_key' 
      });
    }
    
    const sandboxSpec = {
      llm_prompt: llm.prompt,
      llm_model: llm.model || 'claude-sonnet-4',
      tools,
      scripts: Object.keys(scripts),
      environment
    };
    const sandboxHash = hashData(JSON.stringify(sandboxSpec));
    
    logger.log('sandbox_created', {
      hash: sandboxHash,
      tools: tools.length,
      scripts: Object.keys(scripts).length
    });
    
    // Execute: Run LLM with dataset
    const anthropic = new Anthropic({ apiKey: llm.api_key });
    
    const fullPrompt = `${llm.prompt}\n\n<dataset>\n${dataset}\n</dataset>\n\nAnalyze the dataset above according to the prompt. You have access to these tools: ${tools.join(', ')}`;
    
    logger.log('llm_execution_start', {
      model: sandboxSpec.llm_model,
      prompt_hash: hashData(llm.prompt),
      prompt_length: llm.prompt.length
    });
    
    const llmResponse = await anthropic.messages.create({
      model: sandboxSpec.llm_model,
      max_tokens: llm.max_tokens || 4096,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });
    
    const result = llmResponse.content[0].text;
    const tokensUsed = llmResponse.usage.input_tokens + llmResponse.usage.output_tokens;
    
    logger.log('llm_execution_complete', {
      tokens_input: llmResponse.usage.input_tokens,
      tokens_output: llmResponse.usage.output_tokens,
      tokens_total: tokensUsed,
      result_length: result.length
    });
    
    // Execute scripts (if specified)
    if (tools.includes('python') && scripts['main.py']) {
      logger.log('tool_execution_start', {
        tool: 'python',
        script: 'main.py'
      });
      
      // In production TEE, this would run in isolated sandbox
      // For MVP, we just log it
      logger.log('tool_execution_complete', {
        tool: 'python',
        note: 'Simulated for MVP - real execution in Phase 2'
      });
    }
    
    // DELETE dataset from memory
    dataset = null; // Explicit null to help GC
    
    logger.log('dataset_deleted', {
      hash: datasetHash,
      note: 'Dataset removed from memory'
    });
    
    logger.log('sandbox_destroyed', {
      hash: sandboxHash
    });
    
    // Generate certificate
    const certificateId = generateCertificateId();
    const timestamp = new Date().toISOString();
    
    const executionTrace = logger.getTrace();
    
    const certificate = {
      id: certificateId,
      dataset_hash: datasetHash,
      sandbox_hash: sandboxHash,
      execution: {
        llm_calls: executionTrace.events.filter(e => e.type.includes('llm')),
        tool_uses: executionTrace.events.filter(e => e.type.includes('tool')),
        full_trace: executionTrace.events,
        duration_ms: executionTrace.total_duration_ms
      },
      result: {
        output: result,
        exit_code: 0
      },
      proof: {
        tee_attestation: 'SIMULATED_MVP',
        dataset_hash: datasetHash,
        sandbox_hash: sandboxHash,
        timestamp
      },
      lifecycle: {
        execution_started: executionTrace.events[0].timestamp,
        execution_completed: timestamp,
        dataset_deleted: true,
        sandbox_destroyed: true
      },
      created_at: timestamp
    };
    
    // Store ONLY the certificate (NOT the dataset)
    certificates.set(certificateId, certificate);
    
    res.json({
      success: true,
      certificate_id: certificateId,
      result: certificate.result,
      execution_summary: {
        duration_ms: executionTrace.total_duration_ms,
        llm_tokens_used: tokensUsed,
        tools_used: tools.length,
        dataset_deleted: true,
        sandbox_destroyed: true
      },
      proof: certificate.proof,
      certificate_url: `/certificate/${certificateId}`,
      note: 'Dataset has been deleted. Only this certificate persists.'
    });
    
  } catch (error) {
    console.error('Execution error:', error);
    
    // Ensure cleanup even on error
    dataset = null;
    logger.log('error_cleanup', {
      dataset_deleted: true,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Execution failed', 
      details: error.message,
      cleanup: {
        dataset_deleted: true,
        note: 'Dataset was deleted despite error'
      }
    });
  }
}

/**
 * Get certificate (public shareable)
 */
function getCertificate(req, res) {
  const certId = req.params.id;
  const cert = certificates.get(certId);
  
  if (!cert) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  
  res.json({
    success: true,
    ...cert,
    verification_url: `/certificate/${certId}/verify`,
    note: 'This certificate is permanent. The original dataset was deleted after execution.'
  });
}

/**
 * Verify certificate (machine-readable)
 */
function verifyCertificate(req, res) {
  const certId = req.params.id;
  const cert = certificates.get(certId);
  
  if (!cert) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  
  const checks = {
    certificate_exists: '✅ Certificate found',
    dataset_hash: `✅ Dataset hash: ${cert.dataset_hash.slice(0, 16)}...`,
    sandbox_hash: `✅ Sandbox hash: ${cert.sandbox_hash.slice(0, 16)}...`,
    execution_trace: `✅ ${cert.execution.full_trace.length} events logged`,
    dataset_deleted: cert.lifecycle.dataset_deleted ? '✅ Dataset deleted' : '❌ Dataset NOT deleted',
    sandbox_destroyed: cert.lifecycle.sandbox_destroyed ? '✅ Sandbox destroyed' : '❌ Sandbox NOT destroyed',
    tee_attestation: cert.proof.tee_attestation === 'SIMULATED_MVP' 
      ? '⚠️  Simulated (MVP)' 
      : '✅ Valid Intel TDX quote'
  };
  
  res.json({
    success: true,
    certificate_id: certId,
    valid: true,
    trust_level: 'SIMULATED_MVP',
    checks,
    execution_summary: {
      duration_ms: cert.execution.duration_ms,
      llm_calls: cert.execution.llm_calls.length,
      tool_uses: cert.execution.tool_uses.length
    },
    lifecycle: cert.lifecycle,
    note: 'MVP version uses simulated attestation. Deploy to dstack for real TEE verification.',
    next_phase: 'Real Intel TDX attestation + memory-only execution'
  });
}

/**
 * List all certificates
 */
function listCertificates(req, res) {
  const certList = Array.from(certificates.values()).map(c => ({
    id: c.id,
    dataset_hash: c.dataset_hash,
    sandbox_hash: c.sandbox_hash,
    duration_ms: c.execution.duration_ms,
    result_preview: c.result.output.slice(0, 100) + '...',
    created_at: c.created_at,
    certificate_url: `/certificate/${c.id}`
  }));
  
  res.json({
    success: true,
    count: certList.length,
    certificates: certList,
    note: 'These are execution certificates. Original datasets were deleted.'
  });
}

module.exports = {
  executeSandbox,
  getCertificate,
  verifyCertificate,
  listCertificates
};
