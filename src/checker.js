import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

const agentCache = new Map();

function buildAgent(proxyUrl, timeout) {
  if (!proxyUrl) return undefined;
  if (agentCache.has(proxyUrl)) return agentCache.get(proxyUrl);

  let agent;
  if (/^socks[45]:\/\//i.test(proxyUrl)) {
    agent = new SocksProxyAgent(proxyUrl, { timeout, keepAlive: true });
  } else {
    agent = new HttpsProxyAgent(proxyUrl, { timeout, keepAlive: true });
  }

  if (agentCache.size > 2000) agentCache.clear();
  agentCache.set(proxyUrl, agent);
  return agent;
}

export async function checkUsername(username, token, proxy, config) {
  const baseUrl = `https://discord.com/api/${config.apiVersion || 'v9'}`;
  const timeout = config.requestTimeout || 4500;
  const agent = buildAgent(proxy, timeout);

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://discord.com',
    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  };

  if (token) {
    headers['Authorization'] = token;
  } else {
    headers['Referer'] = 'https://discord.com/register';
  }

  const axiosOpts = {
    timeout,
    headers,
    validateStatus: () => true,
  };

  if (agent) {
    axiosOpts.httpsAgent = agent;
    axiosOpts.httpAgent = agent;
  }

  try {
    let endpoint = token
      ? `${baseUrl}/users/@me/pomelo-attempt`
      : `${baseUrl}/unique-username/username-attempt-unauthed`;

    let res = await axios.post(endpoint, { username }, axiosOpts);

    if (token && (res.status === 401 || res.status === 403 || res.status === 429)) {
      delete axiosOpts.headers['Authorization'];
      axiosOpts.headers['Referer'] = 'https://discord.com/register';
      res = await axios.post(
        `${baseUrl}/unique-username/username-attempt-unauthed`,
        { username },
        axiosOpts,
      );
    }

    if (res.status === 200) {
      const taken = res.data?.taken ?? true;
      return {
        username,
        available: !taken,
        status: res.status,
      };
    }

    if (res.status === 429) {
      const retryAfter = res.data?.retry_after ?? (config.rateLimitDelay || 5000) / 1000;
      return {
        username,
        available: null,
        status: 429,
        retryAfter: retryAfter * 1000,
        error: 'Rate limited',
      };
    }

    if (res.status === 407) {
      return {
        username,
        available: null,
        status: 407,
        error: 'Proxy auth required',
      };
    }

    if (res.status === 400) {
      return {
        username,
        available: null,
        status: 400,
        error: 'Invalid username format',
      };
    }

    return {
      username,
      available: null,
      status: res.status,
      error: `Status ${res.status}`,
    };
  } catch (err) {
    return {
      username,
      available: null,
      status: 0,
      error: err.code || err.message,
    };
  }
}