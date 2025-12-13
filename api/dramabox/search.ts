import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { baseHeaders, getSignatureHeaders } from '../lib/dramaboxAuth';

const API_BASE = 'https://sapi.dramaboxdb.com/drama-box';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const keyword = req.query.keyword as string || req.body?.keyword;
    
    if (!keyword) {
      res.status(400).json({ success: false, message: 'Keyword is required' });
      return;
    }

    const payload = { keyword };
    const sig = getSignatureHeaders(payload);
    const url = `${API_BASE}/search/suggest?timestamp=${sig.timestamp}`;
    
    const requestHeaders = {
      ...baseHeaders,
      sn: sig.signature,
    };

    const response = await axios.post(url, payload, { headers: requestHeaders });
    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search',
    });
  }
}

