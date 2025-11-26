import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Gestion des requêtes preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL param missing' });
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined, // important pour éviter erreurs
      },
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : req.body,
      redirect: 'follow', // ou 'manual' si tu veux bloquer les redirections
    };

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Re-forward le contenu
    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
