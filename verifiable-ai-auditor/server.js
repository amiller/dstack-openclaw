#!/usr/bin/env node
/**
 * Verifiable AI Auditor - MVP Server
 * 
 * Provides cryptographically verifiable skill audits via Claude API
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Load audit prompt template
const AUDIT_PROMPT_TEMPLATE = fs.readFileSync(
  path.join(__dirname, 'audit-prompt.md'),
  'utf8'
);

// Calculate prompt hash (for verification)
const PROMPT_HASH = crypto
  .createHash('sha256')
  .update(AUDIT_PROMPT_TEMPLATE)
  .digest('hex');

/**
 * Hash skill content for verification
 */
function hashSkill(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Build audit prompt with skill content
 */
function buildAuditPrompt(skillContent) {
  return AUDIT_PROMPT_TEMPLATE
    .replace('{{SKILL_CONTENT}}', skillContent)
    .replace('{{PROMPT_HASH}}', PROMPT_HASH);
}

/**
 * Call Anthropic API and capture TLS details
 */
async function auditWithClaude(skillContent) {
  const prompt = buildAuditPrompt(skillContent);
  
  // TODO: Implement TLS fingerprint capture
  // For MVP, we'll use fetch and trust the connection
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Extract Claude's response (should be JSON)
  const auditResult = JSON.parse(data.content[0].text);
  
  // TODO: Capture TLS certificate fingerprint
  const tlsFingerprint = 'MVP_PLACEHOLDER';
  
  return {
    audit: auditResult,
    tlsFingerprint,
    model: data.model,
    usage: data.usage
  };
}

/**
 * POST /audit - Audit a skill
 */
app.post('/audit', async (req, res) => {
  try {
    const { skill, name, version } = req.body;
    
    if (!skill) {
      return res.status(400).json({ error: 'Missing skill content' });
    }
    
    // Hash the skill
    const skillHash = hashSkill(skill);
    
    // Audit with Claude
    const { audit, tlsFingerprint, model, usage } = await auditWithClaude(skill);
    
    // Generate attestation ID
    const attestationId = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    
    // Build response
    const result = {
      attestation_id: attestationId,
      timestamp,
      skill: {
        hash: skillHash,
        name: name || 'unknown',
        version: version || 'unknown'
      },
      audit: {
        verdict: audit.verdict,
        confidence: audit.confidence,
        reasoning: audit.reasoning,
        concerns: audit.concerns,
        dependencies: audit.dependencies,
        recommendation: audit.recommendation,
        severity_score: audit.severity_score
      },
      proof: {
        model: model,
        prompt_hash: PROMPT_HASH,
        tls_fingerprint: tlsFingerprint,
        api_endpoint: 'https://api.anthropic.com/v1/messages'
      },
      metadata: {
        tokens_used: usage.input_tokens + usage.output_tokens,
        auditor_version: '1.0.0-mvp'
      }
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ 
      error: 'Audit failed', 
      message: error.message 
    });
  }
});

/**
 * GET /verify/:attestation_id - Verify an attestation
 */
app.get('/verify/:attestation_id', async (req, res) => {
  // TODO: Implement attestation storage and retrieval
  res.json({ 
    message: 'Verification endpoint - coming soon',
    attestation_id: req.params.attestation_id 
  });
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0-mvp',
    prompt_hash: PROMPT_HASH
  });
});

/**
 * GET / - API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Verifiable AI Auditor',
    version: '1.0.0-mvp',
    endpoints: {
      audit: 'POST /audit',
      verify: 'GET /verify/:attestation_id',
      health: 'GET /health'
    },
    prompt_hash: PROMPT_HASH
  });
});

// Start server
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable required');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Verifiable AI Auditor running on port ${PORT}`);
  console.log(`Prompt hash: ${PROMPT_HASH}`);
  console.log(`Ready to audit skills!`);
});
