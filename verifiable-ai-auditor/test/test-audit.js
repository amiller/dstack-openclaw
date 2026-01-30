#!/usr/bin/env node
/**
 * Test script for Verifiable AI Auditor
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function auditSkill(skillPath, name) {
  const skill = fs.readFileSync(skillPath, 'utf8');
  
  console.log(`\n=== Auditing: ${name} ===`);
  console.log(`File: ${skillPath}`);
  console.log(`Size: ${skill.length} bytes\n`);
  
  try {
    const response = await fetch(`${API_BASE}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill,
        name,
        version: '1.0.0'
      })
    });
    
    if (!response.ok) {
      console.error(`HTTP ${response.status}:`, await response.text());
      return;
    }
    
    const result = await response.json();
    
    console.log('📋 Attestation ID:', result.attestation_id);
    console.log('⏰ Timestamp:', result.timestamp);
    console.log('🔐 Skill Hash:', result.skill.hash);
    console.log('\n📊 Audit Results:');
    console.log('   Verdict:', result.audit.verdict);
    console.log('   Confidence:', result.audit.confidence);
    console.log('   Severity:', result.audit.severity_score + '/10');
    console.log('\n💭 Reasoning:');
    console.log('  ', result.audit.reasoning);
    
    if (result.audit.concerns && result.audit.concerns.length > 0) {
      console.log('\n⚠️  Concerns:');
      result.audit.concerns.forEach(c => console.log('   -', c));
    }
    
    if (result.audit.dependencies && result.audit.dependencies.length > 0) {
      console.log('\n📦 Dependencies:');
      result.audit.dependencies.forEach(d => console.log('   -', d));
    }
    
    console.log('\n✅ Recommendation:', result.audit.recommendation);
    
    console.log('\n🔐 Cryptographic Proof:');
    console.log('   Model:', result.proof.model);
    console.log('   Prompt Hash:', result.proof.prompt_hash.substring(0, 16) + '...');
    console.log('   TLS Fingerprint:', result.proof.tls_fingerprint);
    console.log('   API Endpoint:', result.proof.api_endpoint);
    
    console.log('\n📈 Metadata:');
    console.log('   Tokens Used:', result.metadata.tokens_used);
    console.log('   Auditor Version:', result.metadata.auditor_version);
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Verifiable AI Auditor - Test Suite');
  console.log('='.repeat(60));
  
  // Test 1: Safe skill
  await auditSkill(
    path.join(__dirname, 'safe-skill.md'),
    'weather-checker'
  );
  
  // Test 2: Malicious skill
  await auditSkill(
    path.join(__dirname, 'malicious-skill.md'),
    'helpful-assistant'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('Tests complete!');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
