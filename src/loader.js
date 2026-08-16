import fs from 'fs';
import path from 'path';

export function getAppRoot() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) return process.env.PORTABLE_EXECUTABLE_DIR;
  if (process.pkg) return path.dirname(process.execPath);
  const exeCandidate = process.argv[0];
  if (exeCandidate && exeCandidate.endsWith('.exe') && !exeCandidate.toLowerCase().includes('node.exe')) {
    return path.dirname(exeCandidate);
  }
  return process.cwd();
}

const ROOT = getAppRoot();

const DEFAULT_CONFIG = {
  threads: 20,
  retryOnRateLimit: true,
  rateLimitDelay: 3000,
  requestTimeout: 4500,
  useProxies: true,
  apiVersion: "v9",
  saveHits: true,
  hitsFile: "hits.txt",
  outputInvalid: true,
  invalidFile: "invalid.txt",
  webhookUrl: "",
  enableWebhook: false
};

export function ensureAppFiles() {
  const cfg = path.resolve(ROOT, 'config.json');
  if (!fs.existsSync(cfg)) {
    try {
      fs.writeFileSync(cfg, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    } catch {}
  }
  const ensure = ['tokens.txt', 'proxies.txt', 'hits.txt', 'invalid.txt', 'usernames.txt'];
  for (const f of ensure) {
    const p = path.resolve(ROOT, f);
    if (!fs.existsSync(p)) {
      try { fs.writeFileSync(p, '', 'utf-8'); } catch {}
    }
  }
  const wrd = path.resolve(ROOT, 'words.txt');
  if (!fs.existsSync(wrd)) {
    try {
      fs.writeFileSync(wrd, 'enzo\ndiscord\nhunter\npomelo\nchecker\n', 'utf-8');
    } catch {}
  }
}

export function loadLines(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
  if (!fs.existsSync(abs)) {
    try {
      fs.writeFileSync(abs, '', 'utf-8');
    } catch {}
    return [];
  }
  return fs
    .readFileSync(abs, 'utf-8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

export function loadConfig() {
  ensureAppFiles();
  const cfgPath = path.resolve(ROOT, 'config.json');
  try {
    const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    return {
      threads: raw.threads ?? 20,
      retryOnRateLimit: raw.retryOnRateLimit ?? true,
      rateLimitDelay: raw.rateLimitDelay ?? 3000,
      requestTimeout: raw.requestTimeout ?? 4500,
      useProxies: raw.useProxies ?? true,
      rotateTokens: raw.rotateTokens ?? true,
      apiVersion: raw.apiVersion ?? 'v9',
      saveHits: raw.saveHits ?? true,
      hitsFile: raw.hitsFile ?? 'hits.txt',
      outputInvalid: raw.outputInvalid ?? true,
      invalidFile: raw.invalidFile ?? 'invalid.txt',
      webhookUrl: raw.webhookUrl ?? '',
      enableWebhook: raw.enableWebhook ?? Boolean(raw.webhookUrl),
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function loadTokens() {
  return loadLines('tokens.txt');
}

export function loadProxies() {
  return loadLines('proxies.txt').map((p) => {
    if (/^(https?|socks[45]):\/\//i.test(p)) return p;
    return `http://${p}`;
  });
}

export function loadWords() {
  const fromWords = loadLines('words.txt');
  if (fromWords.length > 0) return fromWords;
  return loadLines('usernames.txt');
}

export function appendToFile(filePath, line) {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
  fs.appendFileSync(abs, line + '\n', 'utf-8');
}
