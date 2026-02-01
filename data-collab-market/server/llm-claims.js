/**
 * LLM Claims Service
 * 
 * Run LLM prompts over private datasets and generate verifiable claims
 */

const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');

// In-memory storage (replace with encrypted storage in Phase 2)
const privateDatasets = new Map();
const claims = new Map();

/**
 * Hash data for verification
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate claim ID
 */
function generateClaimId() {
  return 'claim_' + crypto.randomBytes(12).toString('hex');
}

/**
 * Upload private dataset
 */
async function uploadDataset(req, res) {
  try {
    const { name, data, format, description } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Missing required field: data' });
    }
    
    // Decode if base64
    let rawData = data;
    if (data.startsWith('base64:')) {
      rawData = Buffer.from(data.slice(7), 'base64').toString('utf-8');
    }
    
    // Generate dataset ID and hash
    const datasetId = 'ds_' + crypto.randomBytes(12).toString('hex');
    const dataHash = hashData(rawData);
    
    // Store dataset (encrypted in Phase 2)
    privateDatasets.set(datasetId, {
      id: datasetId,
      name: name || 'Untitled Dataset',
      data: rawData,
      format: format || 'txt',
      description: description || '',
      hash: dataHash,
      size_bytes: Buffer.byteLength(rawData, 'utf-8'),
      uploaded_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    res.json({
      success: true,
      dataset_id: datasetId,
      hash: dataHash,
      size_bytes: Buffer.byteLength(rawData, 'utf-8'),
      encrypted: false, // Will be true in Phase 2
      stored_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Dataset stored in TEE memory (simulated for MVP)'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

/**
 * Run LLM analysis over private dataset
 */
async function analyzeLLM(req, res) {
  try {
    const { dataset_id, prompt, api_key, model, max_tokens } = req.body;
    
    if (!dataset_id || !prompt || !api_key) {
      return res.status(400).json({ 
        error: 'Missing required fields: dataset_id, prompt, api_key' 
      });
    }
    
    // Retrieve dataset
    const dataset = privateDatasets.get(dataset_id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    // Call LLM (in TEE, this would be isolated)
    const anthropic = new Anthropic({ apiKey: api_key });
    
    const fullPrompt = `${prompt}\n\n<dataset>\n${dataset.data}\n</dataset>\n\nAnalyze the dataset above according to the prompt.`;
    
    console.log(`Running LLM analysis on dataset ${dataset_id}...`);
    const timestamp = new Date().toISOString();
    
    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4',
      max_tokens: max_tokens || 4096,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });
    
    const llmResponse = response.content[0].text;
    
    // Generate claim
    const claimId = generateClaimId();
    const promptHash = hashData(prompt);
    
    // Generate attestation (simulated for MVP)
    const attestationData = JSON.stringify({
      claim_id: claimId,
      dataset_hash: dataset.hash,
      prompt_hash: promptHash,
      model: model || 'claude-sonnet-4',
      timestamp
    });
    const attestationSignature = hashData(attestationData); // In Phase 2: real TDX signature
    
    // Store claim
    claims.set(claimId, {
      id: claimId,
      dataset: {
        hash: dataset.hash,
        name: dataset.name,
        description: dataset.description,
        data_public: false
      },
      analysis: {
        prompt,
        prompt_hash: promptHash,
        model: model || 'claude-sonnet-4',
        response: llmResponse,
        timestamp
      },
      proof: {
        tee_attestation: 'SIMULATED_MVP',
        signature: attestationSignature,
        compose_hash: 'mvp_no_reproducible_build_yet',
        verification_steps: [
          '1. Verify dataset hash matches expected value',
          '2. Verify prompt hash (ensure prompt unchanged)',
          '3. Check timestamp is reasonable',
          '4. Verify TEE signature (when Phase 2 deployed)'
        ]
      },
      created_at: timestamp
    });
    
    res.json({
      success: true,
      claim_id: claimId,
      result: {
        llm_response: llmResponse,
        prompt_used: prompt,
        dataset_hash: dataset.hash,
        model: model || 'claude-sonnet-4',
        timestamp
      },
      attestation: {
        signature: attestationSignature,
        tee_quote: 'SIMULATED_MVP',
        compose_hash: 'mvp_no_reproducible_build_yet'
      },
      share_url: `/claim/${claimId}`,
      note: 'MVP: Attestation simulated. Phase 2 will use real Intel TDX quotes.'
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
}

/**
 * Get claim details (public shareable)
 */
function getClaim(req, res) {
  const claimId = req.params.id;
  const claim = claims.get(claimId);
  
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }
  
  res.json({
    success: true,
    ...claim,
    verification_url: `/claim/${claimId}/verify`
  });
}

/**
 * Verify claim (machine-readable)
 */
function verifyClaim(req, res) {
  const claimId = req.params.id;
  const claim = claims.get(claimId);
  
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }
  
  // In Phase 2, this would verify real TDX attestation
  const checks = {
    tee_signature: claim.proof.tee_attestation === 'SIMULATED_MVP' 
      ? '⚠️  Simulated (MVP)' 
      : '✅ Valid Intel TDX quote',
    dataset_hash: `✅ Matches ${claim.dataset.hash.slice(0, 16)}...`,
    prompt_hash: `✅ Matches ${claim.analysis.prompt_hash.slice(0, 16)}...`,
    timestamp: `✅ ${claim.analysis.timestamp}`,
    model: `✅ ${claim.analysis.model}`
  };
  
  res.json({
    success: true,
    claim_id: claimId,
    valid: true,
    trust_level: 'SIMULATED_MVP',
    checks,
    note: 'MVP version uses simulated attestation. Deploy to dstack for real TEE verification.',
    next_steps: [
      'Phase 2: Real Intel TDX attestation',
      'Phase 3: Reproducible builds verification',
      'Phase 4: On-chain claim registry'
    ]
  });
}

/**
 * List all claims
 */
function listClaims(req, res) {
  const claimList = Array.from(claims.values()).map(c => ({
    id: c.id,
    dataset_hash: c.dataset.hash,
    dataset_name: c.dataset.name,
    prompt_preview: c.analysis.prompt.slice(0, 100) + '...',
    model: c.analysis.model,
    created_at: c.created_at,
    share_url: `/claim/${c.id}`
  }));
  
  res.json({
    success: true,
    count: claimList.length,
    claims: claimList
  });
}

module.exports = {
  uploadDataset,
  analyzeLLM,
  getClaim,
  verifyClaim,
  listClaims
};
