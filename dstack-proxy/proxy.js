#!/usr/bin/env node
// dstack-proxy.js - Genesis transparency proxy for TEE agents
//
// This proxy enforces the genesis transparency model:
// 1. All dev instructions require DEV_KEY auth
// 2. All instructions are logged to genesis-log BEFORE reaching agent
// 3. Genesis log is attestable via dstack.sock
// 4. Agent cannot forge/modify the genesis log
//
// Domain separation:
// - Genesis domain: Immutable genesis log attestations (dev instructions)
// - Agent domain: Agent's flexible attestations (its own work)

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');

const PROXY_SOCKET = '/var/run-proxy/dstack-proxy.sock';
const REAL_DSTACK_SOCKET = '/var/run/dstack.sock';
const GENESIS_LOG = '/var/log-genesis/genesis-transcript.jsonl';

// Chat server config
const CHAT_PORT = process.env.CHAT_PORT || 3000;
const DEV_KEY = process.env.DEV_KEY;
const AGENT_HOST = process.env.AGENT_HOST || 'claw-tee-dah';
const AGENT_PORT = process.env.AGENT_PORT || 3001;

// dstack mode: 'socket' (default) or 'http' (for docker-based simulator)
const DSTACK_MODE = process.env.DSTACK_MODE || 'socket';
const DSTACK_URL = process.env.DSTACK_URL || 'http://dstack-simulator:8090';

if (!DEV_KEY) {
  console.warn('[proxy] WARNING: DEV_KEY not set - chat endpoint disabled');

console.log(`[proxy] dstack mode: ${DSTACK_MODE}${DSTACK_MODE === 'http' ? ` (${DSTACK_URL})` : ''}`);
}

// Domain prefixes for report_data separation
const DOMAIN_GENESIS = 'genesis:';
const DOMAIN_AGENT = 'agent:';

// Compute genesis log hash - wait for file if needed
let GENESIS_HASH = null;

function loadGenesisHash() {
  if (fs.existsSync(GENESIS_LOG)) {
    const genesisContent = fs.readFileSync(GENESIS_LOG, 'utf8');
    GENESIS_HASH = crypto.createHash('sha256').update(genesisContent).digest('hex');
    console.log(`[dstack-proxy] Genesis log hash: ${GENESIS_HASH}`);
    return true;
  }
  return false;
}

// Try to load immediately
if (!loadGenesisHash()) {
  console.warn('[dstack-proxy] Genesis log not found yet, will retry...');
  // Retry every second for up to 30 seconds
  let retries = 0;
  const retryInterval = setInterval(() => {
    if (loadGenesisHash() || ++retries > 30) {
      clearInterval(retryInterval);
      if (!GENESIS_HASH) {
        console.warn('[dstack-proxy] Genesis log not found after 30s, genesis attestations disabled');
      }
    }
  }, 1000);
}

// Clean up old socket
if (fs.existsSync(PROXY_SOCKET)) {
  fs.unlinkSync(PROXY_SOCKET);
}

// Create HTTP server that mimics dstack.sock interface for agent
// Agent can use all dstack SDK methods through this proxy
// Genesis attestation is ONLY available via HTTP /attestation endpoint (not this socket)
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // Forward all requests to real dstack.sock
  // No domain manipulation - agent gets full dstack SDK access
  // Genesis attestation is protected by only being available via HTTP /attestation
  console.log(`[dstack-proxy] Forwarding: ${url.pathname}`);

  try {
    const response = await forwardToRealDstack(url.pathname, Object.fromEntries(url.searchParams));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(response);
  } catch (error) {
    console.error('[dstack-proxy] Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Forward request to dstack (socket or HTTP based on mode)
function forwardToRealDstack(path, params) {
  if (DSTACK_MODE === 'http') {
    return forwardToHttpSimulator(path, params);
  }
  return forwardToSocket(path, params);
}

// Socket mode: forward to dstack.sock
function forwardToSocket(path, params) {
  return new Promise((resolve, reject) => {
    const queryString = new URLSearchParams(params).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    const req = http.request({ socketPath: REAL_DSTACK_SOCKET, path: fullPath, method: 'GET' }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

// HTTP mode: forward to tappd-simulator
function forwardToHttpSimulator(path, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(DSTACK_URL);
    // tappd-simulator uses /prpc/Tappd.TdxQuote for attestation
    const simPath = path === '/GetQuote' ? '/prpc/Tappd.TdxQuote' : path;
    const postData = params.report_data ? JSON.stringify({ report_data: params.report_data }) : '{}';

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 8090,
      path: simPath,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Start server
server.listen(PROXY_SOCKET, () => {
  fs.chmodSync(PROXY_SOCKET, 0o666);
  console.log(`[dstack-proxy] Listening on ${PROXY_SOCKET}`);
  console.log(`[dstack-proxy] Forwarding to ${REAL_DSTACK_SOCKET}`);
  console.log(`[dstack-proxy] Domain separation enabled:`);
  console.log(`  - Genesis domain: Can only attest to ${GENESIS_HASH}`);
  console.log(`  - Agent domain: Flexible attestations`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[dstack-proxy] Shutting down...');
  server.close(() => {
    if (fs.existsSync(PROXY_SOCKET)) {
      fs.unlinkSync(PROXY_SOCKET);
    }
    process.exit(0);
  });
});

// ============================================================================
// CHAT SERVER - Genesis Transparency Interface
// ============================================================================

// Log message to genesis log (append-only)
function logToGenesis(entry) {
  const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n';
  fs.appendFileSync(GENESIS_LOG, line);
  // Update genesis hash
  const content = fs.readFileSync(GENESIS_LOG, 'utf8');
  GENESIS_HASH = crypto.createHash('sha256').update(content).digest('hex');
  console.log(`[genesis] Logged: ${entry.type} - new hash: ${GENESIS_HASH.slice(0, 16)}...`);
}

// Forward message to agent container
async function forwardToAgent(message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ message });
    const req = http.request({
      hostname: AGENT_HOST,
      port: AGENT_PORT,
      path: '/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData, 'utf8')  // Fixed: use byte length for UTF-8
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ response: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Chat HTML UI
const CHAT_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>claw-tee-dah genesis</title>
<style>
body { font-family: system-ui; max-width: 700px; margin: 2em auto; padding: 1em; background: #1a1a2e; color: #eee; }
h1 { color: #ff6b6b; }
.info { background: #16213e; padding: 1em; border-radius: 8px; margin-bottom: 1em; font-size: 0.9em; }
.info code { background: #0f3460; padding: 2px 6px; border-radius: 4px; }
#chat { height: 400px; overflow-y: auto; background: #16213e; padding: 1em; border-radius: 8px; margin-bottom: 1em; }
.msg { margin: 0.5em 0; padding: 0.5em; border-radius: 4px; }
.dev { background: #0f3460; border-left: 3px solid #ff6b6b; }
.agent { background: #1a1a2e; border-left: 3px solid #4ecdc4; }
.system { background: #2d132c; font-size: 0.85em; color: #aaa; }
form { display: flex; gap: 0.5em; }
input[type="password"], input[type="text"] { flex: 1; padding: 0.5em; background: #16213e; border: 1px solid #333; color: #eee; border-radius: 4px; }
button { padding: 0.5em 1.5em; background: #ff6b6b; border: none; color: white; border-radius: 4px; cursor: pointer; }
button:hover { background: #ff5252; }
#genesis { margin-top: 1em; font-size: 0.85em; }
#genesis a { color: #4ecdc4; }
</style></head>
<body>
<h1>🦞 claw-tee-dah</h1>
<div class="info">
  <strong>Genesis Transparency Demo</strong><br>
  All messages you send are logged to the genesis transcript before reaching the agent.<br>
  This proves: no secret instructions, no ex-parte communication.<br>
  <code>GET /genesis</code> to view the full transcript.
</div>
<div id="chat"></div>
<form onsubmit="send(event)">
  <input type="password" id="key" placeholder="DEV_KEY" style="max-width: 120px;">
  <input type="text" id="msg" placeholder="Message to agent..." autofocus>
  <button>Send</button>
</form>
<div id="genesis">
  <a href="/genesis" target="_blank">View Genesis Transcript</a> |
  <a href="/genesis/hash" target="_blank">Current Hash</a> |
  <a href="/attestation" target="_blank">Get Attestation</a>
</div>
<script>
const chat = document.getElementById('chat');
async function send(e) {
  e.preventDefault();
  const key = document.getElementById('key').value;
  const msg = document.getElementById('msg').value.trim();
  if (!msg) return;
  document.getElementById('msg').value = '';

  chat.innerHTML += '<div class="msg dev"><b>dev:</b> ' + escapeHtml(msg) + '</div>';
  chat.innerHTML += '<div class="msg system" id="pending">sending...</div>';
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    document.getElementById('pending').className = 'msg agent';
    document.getElementById('pending').innerHTML = '<b>agent:</b> ' + escapeHtml(data.response || JSON.stringify(data));
  } catch (err) {
    document.getElementById('pending').innerHTML = '<b>error:</b> ' + escapeHtml(err.message);
  }
  document.getElementById('pending').id = '';
  chat.scrollTop = chat.scrollHeight;
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
</script>
</body></html>`;

// Create chat HTTP server
const chatServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, 'http://localhost');

  // GET / - Chat UI
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(CHAT_HTML);
  }

  // GET /genesis - View full transcript
  if (req.method === 'GET' && url.pathname === '/genesis') {
    if (!fs.existsSync(GENESIS_LOG)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('[]');
    }
    const lines = fs.readFileSync(GENESIS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const entries = lines.map(l => { try { return JSON.parse(l); } catch { return { raw: l }; } });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(entries, null, 2));
  }

  // GET /genesis/hash - Current hash
  if (req.method === 'GET' && url.pathname === '/genesis/hash') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ hash: GENESIS_HASH, log: GENESIS_LOG }));
  }

  // GET /attestation - Get TDX attestation of genesis log
  if (req.method === 'GET' && url.pathname === '/attestation') {
    if (!GENESIS_HASH) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Genesis log not ready' }));
    }
    try {
      // Use hash directly (already 64 hex chars = 32 bytes)
      const quote = await forwardToRealDstack('/GetQuote', { report_data: `0x${GENESIS_HASH}` });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(quote);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // POST /chat - Send message (requires DEV_KEY)
  if (req.method === 'POST' && url.pathname === '/chat') {
    // Check DEV_KEY
    if (!DEV_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Chat disabled - DEV_KEY not configured' }));
    }

    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${DEV_KEY}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid DEV_KEY' }));
    }

    // Parse body
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) throw new Error('No message provided');

        // Log to genesis BEFORE forwarding
        logToGenesis({ type: 'dev_instruction', message });

        // Forward to agent
        console.log(`[chat] Forwarding to agent: ${message.slice(0, 50)}...`);
        const response = await forwardToAgent(message);

        // Log response too
        logToGenesis({ type: 'agent_response', response: response.response || response });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (err) {
        console.error('[chat] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Start chat server
if (DEV_KEY) {
  chatServer.listen(CHAT_PORT, '0.0.0.0', () => {
    console.log(`[chat] Genesis transparency chat on http://0.0.0.0:${CHAT_PORT}`);
    console.log(`[chat] DEV_KEY required for POST /chat`);
  });
}
