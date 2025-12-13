import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = req.query.query as string | undefined;
    if (!query) {
      res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required'
      });
      return;
    }

    const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[search] API error (${response.status}):`, errorText);
      res.status(response.status).json({ 
        success: false, 
        message: `API returned ${response.status}`,
        error: errorText.substring(0, 500)
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('[search] Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unexpected server error',
      error: String(error)
    });
  }
}

