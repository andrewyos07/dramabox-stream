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
    let endpoint = '';
    
    // Method 1: Try to get from query.path (Vercel catch-all route format)
    const path = req.query.path;
    if (path) {
      if (Array.isArray(path)) {
        endpoint = path.join('/');
      } else if (typeof path === 'string') {
        endpoint = path;
      }
    }
    
    // Method 2: Extract from URL pathname if query.path is not available
    if (!endpoint && req.url) {
      const urlPath = req.url.split('?')[0]; // Remove query string
      // Remove /api/dramabox prefix
      const match = urlPath.match(/^\/api\/dramabox\/(.+)$/);
      if (match && match[1]) {
        endpoint = match[1];
      }
    }
    
    if (!endpoint) {
      console.error('[dramabox-proxy] No endpoint provided', {
        query: req.query,
        url: req.url,
        method: req.method
      });
      res.status(400).json({ 
        success: false, 
        message: 'No endpoint provided',
        debug: {
          query: req.query,
          url: req.url
        }
      });
      return;
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

    console.log(`[dramabox-proxy] Request details:`, {
      method: req.method,
      endpoint,
      url,
      query: req.query,
      originalUrl: req.url
    });

    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    };

    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    
    console.log(`[dramabox-proxy] Response status: ${response.status} for ${url}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[dramabox-proxy] API error (${response.status}):`, errorText);
      res.status(response.status).json({ 
        success: false, 
        message: `API returned ${response.status}`,
        error: errorText.substring(0, 500) // Limit error text length
      });
      return;
    }
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    let data;
    
    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON even if content-type doesn't say so
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } catch (parseError) {
      console.error('[dramabox-proxy] Failed to parse response:', parseError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to parse API response',
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      return;
    }

    // Forward status and headers (but be careful with CORS headers)
    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Don't forward certain headers that might conflict
      if (
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length' &&
        !lowerKey.startsWith('access-control-')
      ) {
        res.setHeader(key, value);
      }
    });
    
    res.json(data);
  } catch (error) {
    console.error('[dramabox-proxy] Unexpected error:', error);
    const message =
      error instanceof Error ? error.message : 'Unexpected server error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({ 
      success: false, 
      message,
      error: String(error),
      ...(errorStack && { stack: errorStack })
    });
  }
}

