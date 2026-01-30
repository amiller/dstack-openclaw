#!/usr/bin/env node
/**
 * Test script - Register example datasets and run computations
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3002';

async function registerDataset(dataset) {
  console.log(`\n📝 Registering: ${dataset.name}`);
  
  const response = await fetch(`${API_BASE}/datasets/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataset)
  });
  
  if (!response.ok) {
    console.error(`❌ Failed: ${response.status}`);
    return null;
  }
  
  const result = await response.json();
  console.log(`✅ Registered: ${result.dataset_id}`);
  console.log(`   Hash: ${result.attestation.hash.substring(0, 16)}...`);
  return result.dataset_id;
}

async function listDatasets() {
  console.log('\n📋 Listing all datasets...\n');
  
  const response = await fetch(`${API_BASE}/datasets`);
  const result = await response.json();
  
  console.log(`Found ${result.count} datasets:\n`);
  result.datasets.forEach(d => {
    const meta = d.attestation.metadata_public;
    console.log(`  📊 ${meta.name}`);
    console.log(`     Topic: ${meta.topic}`);
    console.log(`     Records: ${meta.size_records?.toLocaleString() || 'N/A'}`);
    console.log(`     Keywords: ${meta.keywords_sample.join(', ')}`);
    console.log('');
  });
}

async function computeOverlap(datasetA, datasetB) {
  console.log(`\n🔬 Computing keyword overlap...`);
  
  const response = await fetch(`${API_BASE}/compute/keyword-overlap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataset_a: datasetA,
      dataset_b: datasetB
    })
  });
  
  const result = await response.json();
  
  console.log(`\n✅ Computation complete!`);
  console.log(`   ID: ${result.computation_id}`);
  console.log(`\n📊 Results:`);
  console.log(`   Overlap: ${result.result.overlap_keywords.join(', ')}`);
  console.log(`   Jaccard Similarity: ${result.result.jaccard_similarity}`);
  console.log(`\n   Unique to ${result.metadata.dataset_a}:`);
  console.log(`     ${result.result.unique_to_a.slice(0, 5).join(', ')}...`);
  console.log(`\n   Unique to ${result.metadata.dataset_b}:`);
  console.log(`     ${result.result.unique_to_b.slice(0, 5).join(', ')}...`);
  console.log(`\n🔐 Proof: ${result.proof.computation_hash.substring(0, 16)}...`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Data Collaboration Market - Test Suite');
  console.log('='.repeat(60));
  
  // Example Dataset 1: TEE Research
  const dataset1 = await registerDataset({
    name: 'TEE Research Logs',
    owner: 'amiller',
    topic: 'Trusted Execution Environments',
    size_records: 41435,
    time_range: '2025-12-28 to 2026-01-30',
    keywords: [
      'TEE', 'attestation', 'dstack', 'TDX', 'Intel', 'Phala',
      'reproducible-builds', 'DevProof', 'AppAuth', 'timelocks',
      'account-encumbrance', 'hell.tech', 'TEE_HEE', 'confidential-computing'
    ]
  });
  
  // Example Dataset 2: AI Agent Research
  const dataset2 = await registerDataset({
    name: 'AI Agent Development Logs',
    owner: 'molty_researcher',
    topic: 'AI Agent Architecture',
    size_records: 15200,
    time_range: '2026-01-01 to 2026-01-30',
    keywords: [
      'AI', 'agents', 'OpenClaw', 'Moltbook', 'autonomy',
      'memory', 'skills', 'attestation', 'security', 'verification',
      'trust', 'collaboration', 'multi-agent', 'coordination'
    ]
  });
  
  // Example Dataset 3: Blockchain Data
  const dataset3 = await registerDataset({
    name: 'Blockchain Transaction Analysis',
    owner: 'crypto_analyst',
    topic: 'Cryptocurrency Markets',
    size_records: 89000,
    time_range: '2025-11-01 to 2026-01-30',
    keywords: [
      'blockchain', 'ethereum', 'base', 'transactions', 'smart-contracts',
      'DeFi', 'attestation', 'TEE', 'security', 'oracles',
      'payments', 'x402', 'autonomous', 'agents'
    ]
  });
  
  // List all datasets
  await listDatasets();
  
  // Compute overlaps
  if (dataset1 && dataset2) {
    await computeOverlap(dataset1, dataset2);
  }
  
  if (dataset1 && dataset3) {
    await computeOverlap(dataset1, dataset3);
  }
  
  if (dataset2 && dataset3) {
    await computeOverlap(dataset2, dataset3);
  }
  
  // Show stats
  console.log('\n' + '='.repeat(60));
  const statsResponse = await fetch(`${API_BASE}/stats`);
  const stats = await statsResponse.json();
  console.log('\n📈 Platform Statistics:');
  console.log(`   Total Datasets: ${stats.stats.total_datasets}`);
  console.log(`   Total Computations: ${stats.stats.total_computations}`);
  console.log(`   Unique Owners: ${stats.stats.unique_owners}`);
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test suite complete!\n');
}

main().catch(console.error);
