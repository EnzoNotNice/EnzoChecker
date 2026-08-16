import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { getAppRoot } from './loader.js';

const ROOT = getAppRoot();

const PROXY_PROVIDERS = [
  { url: 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all', prefix: 'http://' },
  { url: 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all', prefix: 'socks5://' },
  { url: 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=10000&country=all', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/komutan234/Proxy-List-Free/main/proxies/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/komutan234/Proxy-List-Free/main/proxies/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/komutan234/Proxy-List-Free/main/proxies/socks4.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/socks5/data.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt', prefix: '' },
  { url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/https.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks4.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt', prefix: 'socks4://' },
  { url: 'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt', prefix: 'http://' },
  { url: 'https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks5.txt', prefix: 'socks5://' },
  { url: 'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt', prefix: 'http://' },
];

export async function scrapeProxies() {
  const rawList = new Set();

  const promises = PROXY_PROVIDERS.map(async (src) => {
    try {
      const res = await axios.get(src.url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/plain,*/*',
        },
      });

      if (typeof res.data === 'string') {
        const lines = res.data.split(/\r?\n/);
        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith('#') || line.length > 60) continue;
          if (/^(https?|socks[45]):\/\//i.test(line)) {
            rawList.add(line);
          } else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(line)) {
            rawList.add((src.prefix || 'http://') + line);
          }
        }
      }
    } catch {
    }
  });

  await Promise.allSettled(promises);

  const arr = [...rawList];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function verifyAndSaveProxies(proxies, onProgress, targetCount = 50, maxThreads = 200, timeout = 1800) {
  const destFile = path.resolve(ROOT, 'proxies.txt');
  const workingSet = new Set();
  let tested = 0;
  let isDone = false;
  const queue = [...proxies];

  if (proxies.length === 0) {
    return [];
  }

  fs.writeFileSync(destFile, '', 'utf-8');

  async function testProxy(proxy) {
    if (isDone) return;
    try {
      const agent = /^socks[45]:\/\//i.test(proxy)
        ? new SocksProxyAgent(proxy, { timeout })
        : new HttpsProxyAgent(proxy, { timeout });

      const res = await axios.get('https://cloudflare.com/cdn-cgi/trace', {
        httpsAgent: agent,
        httpAgent: agent,
        timeout,
        validateStatus: (status) => status === 200,
      });

      if (res.status === 200 && typeof res.data === 'string' && res.data.includes('ip=')) {
        if (!isDone && !workingSet.has(proxy)) {
          workingSet.add(proxy);
          fs.appendFileSync(destFile, proxy + '\n', 'utf-8');

          if (targetCount > 0 && workingSet.size >= targetCount) {
            isDone = true;
            queue.length = 0;
          }
        }
      }
    } catch {
    } finally {
      tested++;
      if (onProgress) {
        onProgress(workingSet.size, tested, proxies.length, targetCount);
      }
    }
  }

  async function worker() {
    while (queue.length > 0 && !isDone) {
      const p = queue.shift();
      if (p) await testProxy(p);
    }
  }

  const workers = [];
  const threads = Math.min(maxThreads, proxies.length);
  for (let i = 0; i < threads; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const finalWorking = [...workingSet];
  fs.writeFileSync(destFile, finalWorking.join('\n') + (finalWorking.length > 0 ? '\n' : ''), 'utf-8');

  return finalWorking;
}
