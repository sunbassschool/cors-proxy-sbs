export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing URL" });
  }

  // ✅ Preflight CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    return res.status(200).end();
  }

  try {
    // ✅ Clean des headers
    const forwardedHeaders = { ...req.headers };
    delete forwardedHeaders.host;
    delete forwardedHeaders.connection;

    const fetchOptions = {
      method: req.method,
      headers: req.method === "GET" || req.method === "HEAD" ? {} : forwardedHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      redirect: "follow", // ✅ suit les redirections
    };

    const proxyRes = await fetch(targetUrl, fetchOptions);
    const contentType = proxyRes.headers.get("content-type") || "text/plain";
    const buffer = await proxyRes.arrayBuffer();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    res.status(proxyRes.status).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
