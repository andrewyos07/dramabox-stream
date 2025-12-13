import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { baseHeaders, getSignatureHeaders } from '../lib/dramaboxAuth';
import token from '../lib/dramaboxToken';

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
    const bookId = req.query.bookId as string || req.body?.bookId;
    const index = req.query.index ? Number(req.query.index) : 1;

    if (!bookId) {
      res.status(400).json({ success: false, message: 'bookId is required' });
      return;
    }

    // Get token first
    const tokenData = await token();
    const headersWithToken = {
      ...baseHeaders,
      'device-id': tokenData.deviceid,
      'android-id': tokenData.androidid,
      tn: `Bearer ${tokenData.token}`,
    };

    const payload = {
      boundaryIndex: 0,
      comingPlaySectionId: -1,
      index,
      currencyPlaySource: 'discover_new_rec_new',
      needEndRecommend: 0,
      currencyPlaySourceName: '',
      preLoad: false,
      rid: '',
      pullCid: '',
      loadDirection: 0,
      startUpKey: '',
      bookId,
    };

    const sig = getSignatureHeaders(
      payload,
      tokenData.deviceid,
      tokenData.androidid,
      `Bearer ${tokenData.token}`
    );
    const url = `${API_BASE}/chapterv2/batch/load?timestamp=${sig.timestamp}`;
    
    const requestHeaders = {
      ...headersWithToken,
      sn: sig.signature,
    };

    const response = await axios.post(url, payload, { headers: requestHeaders });
    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Stream error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stream',
    });
  }
}

