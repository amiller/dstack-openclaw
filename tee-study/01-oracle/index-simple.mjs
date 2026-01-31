import { DstackClient } from "@phala/dstack-sdk"
import { createServer } from "http"
import crypto from "crypto"

const client = new DstackClient()

async function getAttestedData() {
  // Simple statement without external API call
  const statement = {
    message: "Hello from TEE!",
    timestamp: Date.now(),
    randomValue: Math.floor(Math.random() * 1000000)
  }

  // Hash statement and embed in TDX quote
  const hash = crypto.createHash("sha256").update(JSON.stringify(statement)).digest("hex")
  const quote = await client.getQuote(hash)

  return { statement, reportDataHash: hash, quote: quote.quote }
}

createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  if (req.url === "/attest") {
    try {
      const result = await getAttestedData()
      res.end(JSON.stringify(result, null, 2))
    } catch (err) {
      res.end(JSON.stringify({ error: err.message }, null, 2))
    }
  } else {
    const info = await client.info()
    res.end(JSON.stringify({ endpoints: ["/", "/attest"], appId: info.app_id }, null, 2))
  }
}).listen(8080, () => console.log("TEE Oracle at http://localhost:8080"))
