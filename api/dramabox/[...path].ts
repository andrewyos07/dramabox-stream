import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const path = req.query.path as string[] | string;
    let endpoint = '';
    
    if (Array.isArray(path)) {
      endpoint = path.join('/');
    } else if (path) {
      endpoint = path;
    }
    
    // Build query string from query params (excluding 'path')
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) {
        const val = Array.isArray(value) ? value[0] : value;
        if (val) {
          queryParams.append(key, String(val));
        }
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/${endpoint}${queryString ? `?${queryString}` : ''}`;

    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };

    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });
    
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error';
    res.status(500).json({ success: false, message, error: String(error) });
  }
}

