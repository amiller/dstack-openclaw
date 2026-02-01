#!/usr/bin/env node
/**
 * Ephemeral Sandbox Execution Service
 * 
 * ONE-TIME verifiable computation over private data
 * Dataset is NEVER stored - only execution certificates persist
 */

const express = require('express');
const ephemeralSandbox = require('./ephemeral-sandbox');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3003;

// ========================================
// EPHEMERAL SANDBOX EXECUTION
// ========================================

/**
 * POST /execute - Run one-time computation over private dataset
 * 
 * INPUTS:
 *   - dataset (ephemeral, never stored)
 *   - sandbox spec (LLM prompt + tools)
 * 
 * EXECUTION:
 *   - Load dataset → memory
 *   - Run computation
 *   - Log execution trace
 *   - DELETE dataset
 *   - Destroy sandbox
 * 
 * OUTPUT:
 *   - Execution certificate (permanent)
 *   - Result
 *   - Proof of execution
 */
app.post('/execute', ephemeralSandbox.executeSandbox);

/**
 * GET /certificate/:id - View execution certificate (public shareable)
 */
app.get('/certificate/:id', ephemeralSandbox.getCertificate);

/**
 * GET /certificate/:id/verify - Verify certificate cryptographically
 */
app.get('/certificate/:id/verify', ephemeralSandbox.verifyCertificate);

/**
 * GET /certificates - List all execution certificates
 */
app.get('/certificates', ephemeralSandbox.listCertificates);

// ========================================
// API INFO
// ========================================

/**
 * GET / - API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Ephemeral Sandbox Execution Service',
    version: '2.0.0-ephemeral',
    status: 'Active Development',
    concept: 'Verifiable one-time computation over private data',
    key_insight: 'Dataset is NEVER stored - only execution certificates persist',
    
    model: {
      inputs: ['Private dataset (ephemeral)', 'Sandbox spec (LLM + tools)', 'API key'],
      execution: ['Load to memory', 'Run computation', 'Log trace', 'DELETE dataset', 'Destroy sandbox'],
      output: ['Execution certificate (permanent)', 'Result', 'Proof']
    },
    
    endpoints: {
      execute: 'POST /execute',
      view_certificate: 'GET /certificate/:id',
      verify_certificate: 'GET /certificate/:id/verify',
      list_certificates: 'GET /certificates'
    },
    
    example: {
      description: 'Run PII scanner on private dataset',
      request: {
        method: 'POST',
        url: '/execute',
        body: {
          dataset: {
            data: '<private patient records>',
            format: 'csv'
          },
          sandbox: {
            llm: {
              prompt: 'Scan for PII: SSN, email, phone, names',
              model: 'claude-sonnet-4',
              api_key: 'sk-ant-...'
            },
            tools: ['python', 'grep'],
            scripts: {
              'pii_scanner.py': '...'
            }
          }
        }
      },
      response: {
        certificate_id: 'cert_xyz',
        result: { output: '0 PII instances found' },
        proof: { dataset_hash: 'sha256:...', tee_attestation: '0x...' },
        lifecycle: { dataset_deleted: true, sandbox_destroyed: true }
      }
    },
    
    differences_from_registry: {
      old_model: 'Store dataset → Run multiple queries → Keep data',
      new_model: 'Load dataset → Run once → Delete data → Keep certificate only',
      key_difference: 'Dataset is NEVER stored'
    },
    
    use_cases: [
      'Research validation (prove model accuracy)',
      'Compliance certification (GDPR, HIPAA)',
      'Data quality assessment',
      'Competitive benchmarking',
      'Info Bazaar (prove data relevance)'
    ],
    
    next_phase: 'Deploy to dstack for real Intel TDX attestation'
  });
});

/**
 * GET /stats - Service statistics
 */
app.get('/stats', (req, res) => {
  // Get stats from ephemeral-sandbox module
  const certs = require('./ephemeral-sandbox');
  
  res.json({
    success: true,
    stats: {
      total_executions: 0, // Would count from certificates
      datasets_stored: 0, // Always 0 (ephemeral!)
      certificates_issued: 0
    },
    note: 'Datasets are NEVER stored. Only execution certificates persist.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🦞 Ephemeral Sandbox Execution Service`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`\n🔑 Key Concept:`);
  console.log(`   - Dataset is NEVER stored`);
  console.log(`   - One-time execution only`);
  console.log(`   - Certificate proves what happened`);
  console.log(`   - Data deleted immediately after`);
  console.log(`\n✨ Try it:`);
  console.log(`   POST /execute with dataset + sandbox spec`);
  console.log(`   GET /certificate/:id to view proof`);
  console.log(`\nReady for verifiable ephemeral computation!\n`);
});
