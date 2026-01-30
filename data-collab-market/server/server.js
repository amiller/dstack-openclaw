#!/usr/bin/env node
/**
 * Data Collaboration Market - MVP Server
 * 
 * Enables private data collaboration via attestation + computation
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3002;

// In-memory storage (replace with DB later)
const datasets = new Map();
const computations = new Map();

/**
 * Generate attestation for dataset metadata
 */
function generateAttestation(metadata) {
  const timestamp = new Date().toISOString();
  const dataToHash = JSON.stringify({ ...metadata, timestamp });
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  
  return {
    hash,
    timestamp,
    metadata_public: {
      name: metadata.name,
      topic: metadata.topic,
      size_records: metadata.size_records,
      time_range: metadata.time_range,
      keywords_sample: metadata.keywords?.slice(0, 5) || []
    },
    data_private: true,
    tee_status: 'SIMULATED_MVP'
  };
}

/**
 * Extract keywords from dataset (simulated)
 * In real version, this would analyze actual data in TEE
 */
function extractKeywords(datasetId) {
  const dataset = datasets.get(datasetId);
  if (!dataset) return [];
  
  // For MVP, return the keywords from metadata
  return dataset.metadata.keywords || [];
}

/**
 * Compute keyword overlap between two datasets
 */
function computeKeywordOverlap(datasetIdA, datasetIdB) {
  const keywordsA = new Set(extractKeywords(datasetIdA));
  const keywordsB = new Set(extractKeywords(datasetIdB));
  
  const overlap = [...keywordsA].filter(k => keywordsB.has(k));
  const uniqueToA = [...keywordsA].filter(k => !keywordsB.has(k));
  const uniqueToB = [...keywordsB].filter(k => !keywordsA.has(k));
  
  const union = new Set([...keywordsA, ...keywordsB]);
  const jaccardSimilarity = overlap.length / union.size;
  
  return {
    overlap_keywords: overlap,
    overlap_count: overlap.length,
    unique_to_a: uniqueToA,
    unique_to_b: uniqueToB,
    jaccard_similarity: parseFloat(jaccardSimilarity.toFixed(3)),
    total_keywords_a: keywordsA.size,
    total_keywords_b: keywordsB.size
  };
}

/**
 * POST /datasets/register - Register a new dataset
 */
app.post('/datasets/register', (req, res) => {
  try {
    const { name, owner, topic, size_records, time_range, keywords } = req.body;
    
    if (!name || !owner || !topic) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, owner, topic' 
      });
    }
    
    // Generate dataset ID
    const datasetId = 'ds_' + crypto.randomBytes(8).toString('hex');
    
    // Generate attestation
    const attestation = generateAttestation({
      name,
      owner,
      topic,
      size_records,
      time_range,
      keywords
    });
    
    // Store dataset
    datasets.set(datasetId, {
      id: datasetId,
      metadata: { name, owner, topic, size_records, time_range, keywords },
      attestation,
      registered_at: attestation.timestamp
    });
    
    res.json({
      success: true,
      dataset_id: datasetId,
      attestation,
      message: 'Dataset registered! Others can now discover it.',
      discovery_url: `/datasets/${datasetId}`
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /datasets - List all registered datasets
 */
app.get('/datasets', (req, res) => {
  const { topic, owner } = req.query;
  
  let datasetList = Array.from(datasets.values()).map(d => ({
    id: d.id,
    attestation: d.attestation,
    registered_at: d.registered_at
  }));
  
  // Filter by topic
  if (topic) {
    datasetList = datasetList.filter(d => 
      d.attestation.metadata_public.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }
  
  // Filter by owner
  if (owner) {
    datasetList = datasetList.filter(d => 
      datasets.get(d.id).metadata.owner === owner
    );
  }
  
  res.json({
    success: true,
    count: datasetList.length,
    datasets: datasetList,
    tip: 'Use ?topic=X or ?owner=Y to filter'
  });
});

/**
 * GET /datasets/:id - Get specific dataset attestation
 */
app.get('/datasets/:id', (req, res) => {
  const dataset = datasets.get(req.params.id);
  
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }
  
  res.json({
    success: true,
    dataset: {
      id: dataset.id,
      attestation: dataset.attestation,
      registered_at: dataset.registered_at
    }
  });
});

/**
 * POST /compute/keyword-overlap - Compute keyword overlap
 */
app.post('/compute/keyword-overlap', (req, res) => {
  try {
    const { dataset_a, dataset_b } = req.body;
    
    if (!dataset_a || !dataset_b) {
      return res.status(400).json({ 
        error: 'Missing required fields: dataset_a, dataset_b' 
      });
    }
    
    // Verify datasets exist
    if (!datasets.has(dataset_a) || !datasets.has(dataset_b)) {
      return res.status(404).json({ error: 'One or both datasets not found' });
    }
    
    // Compute overlap
    const result = computeKeywordOverlap(dataset_a, dataset_b);
    
    // Generate computation ID
    const computationId = 'comp_' + crypto.randomBytes(8).toString('hex');
    
    // Generate proof
    const timestamp = new Date().toISOString();
    const proofData = JSON.stringify({ dataset_a, dataset_b, result, timestamp });
    const proofHash = crypto.createHash('sha256').update(proofData).digest('hex');
    
    // Store computation
    computations.set(computationId, {
      id: computationId,
      dataset_a,
      dataset_b,
      result,
      timestamp,
      proof_hash: proofHash
    });
    
    res.json({
      success: true,
      computation_id: computationId,
      result,
      proof: {
        computation_hash: proofHash,
        timestamp,
        tee_attestation: 'SIMULATED_MVP',
        note: 'In production, this would be a real TDX attestation'
      },
      metadata: {
        dataset_a: datasets.get(dataset_a).attestation.metadata_public.name,
        dataset_b: datasets.get(dataset_b).attestation.metadata_public.name
      }
    });
    
  } catch (error) {
    console.error('Computation error:', error);
    res.status(500).json({ error: 'Computation failed' });
  }
});

/**
 * GET /compute/:id - Get computation results
 */
app.get('/compute/:id', (req, res) => {
  const computation = computations.get(req.params.id);
  
  if (!computation) {
    return res.status(404).json({ error: 'Computation not found' });
  }
  
  res.json({
    success: true,
    computation
  });
});

/**
 * GET /stats - Platform statistics
 */
app.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      total_datasets: datasets.size,
      total_computations: computations.size,
      unique_owners: new Set(
        Array.from(datasets.values()).map(d => d.metadata.owner)
      ).size
    }
  });
});

/**
 * GET / - API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Data Collaboration Market',
    version: '1.0.0-mvp',
    status: 'Prototype - Gathering Feedback',
    moltbook_post: 'https://moltbook.com/post/2978e8cc-a1e5-40c6-8ac1-61c0fcb235f5',
    endpoints: {
      register: 'POST /datasets/register',
      list: 'GET /datasets',
      view: 'GET /datasets/:id',
      compute: 'POST /compute/keyword-overlap',
      results: 'GET /compute/:id',
      stats: 'GET /stats'
    },
    example_curl: 'curl http://localhost:' + PORT + '/datasets'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🦞 Data Collaboration Market running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`💬 Moltbook: https://moltbook.com/post/2978e8cc-a1e5-40c6-8ac1-61c0fcb235f5`);
  console.log(`\nReady to enable private data collaboration!\n`);
});
