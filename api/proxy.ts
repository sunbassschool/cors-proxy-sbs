export default async function handler(req, res) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing URL" });
  }

  // ⚠️ OPTIONS = préflight, on répond tout de suite
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    return res.status(200).end();
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host,
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // ✅ On ajoute les bons headers CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    const data = await response.arrayBuffer();
    res.writeHead(response.status, headers);
    res.end(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
