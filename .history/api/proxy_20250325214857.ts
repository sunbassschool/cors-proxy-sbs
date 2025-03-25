// api/proxy.ts
export default async function handler(req, res) {
    const targetUrl = req.query.url;
  
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing URL" });
    }
  
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(targetUrl).host,
        },
        body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      });
  
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
  
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  
      if (req.method === "OPTIONS") return res.status(200).end();
  
      const data = await response.arrayBuffer();
      res.writeHead(response.status, headers);
      res.end(Buffer.from(data));
    } catch (error) {
      res.status(500).json({ error: "Proxy error", details: error.message });
    }
  }
  