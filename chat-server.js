#!/usr/bin/env node
// Internal chat server for claw-tee-dah agent
// Receives messages from dstack-proxy, runs openclaw agent, returns response
// This runs INSIDE the agent container on port 3001 (not exposed externally)
//
// FIXED VERSION - Better JSON handling and error logging

const http = require('http')
const { spawn } = require('child_process')

const PORT = process.env.CHAT_PORT || 3001

async function runAgent(message) {
  return new Promise((resolve, reject) => {
    const proc = spawn('openclaw', [
      'agent', '--local', '--json',
      '--agent', 'main',
      '--message', message
    ])
    let stdout = '', stderr = ''
    proc.stdout.on('data', d => stdout += d)
    proc.stderr.on('data', d => stderr += d)
    proc.on('close', code => {
      // Log raw output for debugging
      console.log('[agent] Exit code:', code)
      console.log('[agent] Stdout length:', stdout.length)
      console.log('[agent] Stderr length:', stderr.length)
      
      if (code !== 0) {
        console.error('[agent] Process failed with stderr:', stderr)
        return reject(new Error(stderr || `Exit code ${code}`))
      }
      
      // openclaw --json should return valid JSON
      try {
        const result = JSON.parse(stdout)
        console.log('[agent] Parsed result keys:', Object.keys(result))
        
        // Return the full parsed result
        // Caller can decide what to extract
        resolve(result)
      } catch (parseErr) {
        console.error('[agent] JSON parse failed:', parseErr.message)
        console.error('[agent] Raw stdout (first 500 chars):', stdout.slice(0, 500))
        
        // Fallback: return raw text wrapped in response object
        resolve({ 
          response: stdout.trim(),
          _parseFailed: true 
        })
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/chat') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body)
        if (!message) throw new Error('No message provided')
        
        console.log(`[agent] Processing message (${message.length} chars)`)
        console.log(`[agent] Preview: ${message.slice(0, 100)}...`)
        
        const result = await runAgent(message)
        
        // Log what we're about to send
        console.log('[agent] Result type:', typeof result)
        console.log('[agent] Result keys:', Object.keys(result))
        
        // Validate we can serialize it before sending
        let jsonString
        try {
          jsonString = JSON.stringify(result)
          console.log('[agent] Serialized length:', jsonString.length)
        } catch (serializeErr) {
          console.error('[agent] Serialization failed:', serializeErr.message)
          throw new Error(`Cannot serialize response: ${serializeErr.message}`)
        }
        
        // Send the serialized result
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(jsonString)
        
        console.log('[agent] Response sent successfully')
      } catch (err) {
        console.error('[agent] Error:', err.message)
        console.error('[agent] Stack:', err.stack)
        
        // Send detailed error response
        const errorResponse = {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }
        
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(errorResponse))
      }
    })
    return
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ 
      status: 'ok', 
      agent: 'claw-tee-dah',
      version: 'fixed'
    }))
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[agent] Internal chat server (FIXED VERSION) on http://0.0.0.0:${PORT}`)
  console.log(`[agent] Receives messages from dstack-proxy`)
  console.log(`[agent] Enhanced logging and error handling enabled`)
})
