import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DramaboxApp, baseHeaders, randomAndroidId } from './dramaboxAuth';

function getSignatureHeaders(payload: Record<string, unknown>) {
  const timestamp = Date.now();
  const deviceId = baseHeaders['device-id'];
  const androidId = baseHeaders['android-id'];
  const tn = baseHeaders['tn'];

  const strPayload = `timestamp=${timestamp}${JSON.stringify(payload)}${deviceId}${androidId}${tn}`;
  const signature = DramaboxApp.dramabox(strPayload);
  
  if (!signature) {
    throw new Error('Failed to generate signature');
  }

  return {
    signature,
    timestamp: timestamp.toString(),
  };
}

async function getToken() {
  const payload = {};
  const testSig = getSignatureHeaders(payload);
  const url = `https://sapi.dramaboxdb.com/drama-box/ap001/bootstrap?timestamp=${testSig.timestamp}`;
  
  const requestHeaders = {
    ...baseHeaders,
    sn: testSig.signature,
  };

  const res = await axios.post(url, payload, { headers: requestHeaders });
  
  return {
    token: res.data.data.user.token,
    deviceid: uuidv4(),
    androidid: randomAndroidId(),
  };
}

export default getToken;

