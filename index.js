import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkUsername } from './src/checker.js';
import {
  getAppRoot,
  loadConfig,
  loadProxies,
  loadTokens,
  loadWords,
  appendToFile,
} from './src/loader.js';

const ROOT = getAppRoot();
import {
  generateUsernames,
  generateFromPattern,
  generateAesthetic,
  promptMainMenu,
  promptResumeSession,
} from './src/generator.js';
import {
  scrapeProxies,
  verifyAndSaveProxies,
} from './src/scraper.js';
import {
  hasSession,
  loadSession,
  saveSession,
  clearSession,
} from './src/session.js';
import { sendWebhookHit } from './src/webhook.js';
import {
  showBanner,
  logInfo,
  logSuccess,
  logFail,
  logWarn,
  logError,
  logRateLimit,
  printSeparator,
  printStats,
  printConfig,
  printProgress,
} from './src/ui.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAutoScraper(targetCount = 50) {
  logInfo('Scraping fresh proxies from open-source repositories & APIs...');
  const scraped = await scrapeProxies();
  const limitMsg = targetCount > 0 ? `(stopping at ${targetCount} working)` : '(testing all)';
  logInfo(`Fetched ${scraped.length} raw proxies. Testing proxy connectivity ${limitMsg}...`);

  const live = await verifyAndSaveProxies(
    scraped,
    (alive, tested, total, target) => {
      const goal = target > 0 ? `/${target}` : '';
      process.stdout.write(`\r  [+] Alive: ${alive}${goal} | Tested: ${tested}/${total}   `);
    },
    targetCount,
    200,
    1800
  );

  process.stdout.write('\r\x1b[K');
  console.log('');
  logSuccess(`Saved ${live.length} working live proxies to proxies.txt!`);
  logInfo('Restarting application in 1 second...\n');
  await sleep(1000);
}

async function saveWebhookUrl(url) {
  const cfgPath = path.resolve(ROOT, 'config.json');
  const cfg = loadConfig();
  cfg.webhookUrl = url;
  cfg.enableWebhook = Boolean(url);
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf-8');
  console.log('');
  logSuccess('Discord Webhook URL saved successfully!');
  logInfo('Restarting menu in 2 seconds...\n');
  await sleep(2000);
}

async function main() {
  console.clear();
  showBanner();

  const config = loadConfig();
  const tokens = loadTokens();
  let proxies = loadProxies();

  fs.writeFileSync(path.resolve(ROOT, config.hitsFile), '', 'utf-8');
  fs.writeFileSync(path.resolve(ROOT, config.invalidFile), '', 'utf-8');

  let usernames = [];
  let stats = {
    checked: 0,
    hits: 0,
    taken: 0,
    errors: 0,
    rateLimited: 0,
    startTime: Date.now(),
  };
  let configDisplay = {};
  let totalOriginal = 0;

  if (hasSession()) {
    const session = loadSession();
    const shouldResume = await promptResumeSession(session);
    if (shouldResume) {
      usernames = session.remaining;
      stats = {
        ...session.stats,
        startTime: Date.now(),
      };
      configDisplay = session.configDisplay || {};
      totalOriginal = session.totalOriginal || usernames.length;
      logInfo(`Resumed session with ${usernames.length} targets remaining!`);
    } else {
      clearSession();
    }
  }

  if (usernames.length === 0) {
    const choice = await promptMainMenu();

    if (choice.mode === 'scrape_proxies') {
      await runAutoScraper(choice.targetCount ?? 50);
      return main();
    }

    if (choice.mode === 'setup_webhook') {
      await saveWebhookUrl(choice.webhookUrl);
      return main();
    }

    configDisplay = {
      mode: choice.mode,
      tokens: tokens.length,
      proxies: proxies.length,
      threads: config.threads,
      webhookActive: Boolean(config.enableWebhook && config.webhookUrl),
    };

    if (choice.mode === 'random') {
      const typeLabels = {
        letters: 'letters',
        numbers: 'numbers',
        mixed: 'mixed',
        letters_sym: 'letters+symbols',
        all: 'all (a-z0-9._)',
      };
      logInfo(`Generating ${choice.count}x ${choice.length}-char (${typeLabels[choice.type]})...`);
      usernames = generateUsernames(choice.count, choice.length, choice.type);
      configDisplay.type = typeLabels[choice.type];
      configDisplay.length = choice.length;
      configDisplay.count = usernames.length;
    } else if (choice.mode === 'pattern') {
      logInfo(`Generating ${choice.count}x targets from pattern "${choice.pattern}"...`);
      usernames = generateFromPattern(choice.pattern, choice.count);
      configDisplay.pattern = choice.pattern;
      configDisplay.count = usernames.length;
    } else if (choice.mode === 'aesthetic') {
      logInfo(`Generating ${choice.count}x aesthetic targets (${choice.style})...`);
      usernames = generateAesthetic(choice.style, choice.count);
      configDisplay.type = choice.style;
      configDisplay.count = usernames.length;
    } else if (choice.mode === 'wordlist') {
      usernames = loadWords();
      if (usernames.length === 0) {
        logError('No words found in words.txt or usernames.txt! Please add some words first.');
        process.exit(1);
      }
      logInfo(`Loaded ${usernames.length} words from words.txt`);
      configDisplay.count = usernames.length;
    }

    totalOriginal = usernames.length;
  }

  if (usernames.length === 0) {
    logError('No targets generated or found.');
    process.exit(1);
  }

  console.log('');
  printConfig(configDisplay);

  if (config.useProxies && proxies.length === 0) {
    logWarn('No proxies in proxies.txt, running direct (rate limit risk)');
    config.useProxies = false;
  }

  let tokenIdx = 0;
  function nextToken() {
    if (tokens.length === 0) return null;
    const t = tokens[tokenIdx % tokens.length];
    tokenIdx++;
    return t;
  }

  const proxyState = proxies.map((p) => ({ url: p, blockedUntil: 0 }));
  let proxyIdx = 0;

  function nextProxy() {
    if (!config.useProxies || proxies.length === 0) return { url: null, index: -1 };
    const now = Date.now();
    for (let i = 0; i < proxyState.length; i++) {
      const idx = (proxyIdx + i) % proxyState.length;
      if (proxyState[idx].blockedUntil <= now) {
        proxyIdx = idx + 1;
        return { url: proxyState[idx].url, index: idx };
      }
    }
    let soonest = 0;
    for (let i = 1; i < proxyState.length; i++) {
      if (proxyState[i].blockedUntil < proxyState[soonest].blockedUntil) soonest = i;
    }
    proxyIdx = soonest + 1;
    return {
      url: proxyState[soonest].url,
      index: soonest,
      waitMs: proxyState[soonest].blockedUntil - Date.now(),
    };
  }

  function markLimited(index, ms) {
    if (index >= 0 && index < proxyState.length) {
      proxyState[index].blockedUntil = Date.now() + ms;
    }
  }

  const queue = [...usernames];
  const total = totalOriginal || queue.length;

  function handleExit() {
    if (queue.length > 0) {
      saveSession(queue, stats, configDisplay, total);
    } else {
      clearSession();
    }
  }

  process.on('SIGINT', () => {
    handleExit();
    console.log('\n');
    logWarn('Process interrupted. Progress saved in session.json!');
    process.exit(0);
  });

  async function processUsername(username) {
    let attempts = 0;
    const maxAttempts = proxies.length > 0 ? 5 : 2;

    while (attempts < maxAttempts) {
      attempts++;
      const proxy = nextProxy();
      const token = nextToken();

      if (proxy.waitMs > 0) {
        await sleep(Math.min(proxy.waitMs, 3000));
      }

      const result = await checkUsername(username, token, proxy.url, config);

      if (result.status === 429) {
        stats.rateLimited++;
        markLimited(proxy.index, Math.min(result.retryAfter || 60000, 60000));
        logRateLimit(`${username} // rate limited, rotating proxy`);
        await sleep(500);
        continue;
      }

      if (result.status === 400) {
        stats.errors++;
        return;
      }

      if (result.available === null) {
        stats.errors++;
        if (proxy.index >= 0) {
          const blockDuration = result.status === 407 ? 600000 : 15000;
          markLimited(proxy.index, blockDuration);
        }
        if (attempts < maxAttempts) {
          await sleep(50);
          continue;
        }
        logError(`${username} // ${result.error}`);
        return;
      }

      stats.checked++;

      if (result.available) {
        stats.hits++;
        logSuccess(`${username} // available`);
        if (config.saveHits) appendToFile(config.hitsFile, username);
        if (config.enableWebhook && config.webhookUrl) {
          sendWebhookHit(username, config.webhookUrl, stats).catch(() => {});
        }
      } else {
        stats.taken++;
        logFail(`${username} // taken`);
        if (config.outputInvalid) appendToFile(config.invalidFile, username);
      }
      return;
    }
  }

  logInfo(`Launching ${config.threads} threads`);
  console.log('');

  const workers = [];
  let checksSinceLastSave = 0;

  async function worker() {
    while (queue.length > 0) {
      const u = queue.shift();
      if (!u) break;
      await processUsername(u);
      printProgress(stats.checked + stats.errors, total, stats);

      if (++checksSinceLastSave >= 50) {
        checksSinceLastSave = 0;
        saveSession(queue, stats, configDisplay, total);
      }
    }
  }

  for (let i = 0; i < config.threads; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  clearSession();

  console.log('');
  printStats(stats);

  if (stats.hits > 0) {
    logInfo(`Available usernames saved to ${config.hitsFile}`);
    if (config.enableWebhook && config.webhookUrl) {
      logSuccess('Webhook notifications sent for all hits!');
    }
  }
}

main().catch((err) => {
  logError(err.message || String(err));
  console.log('\n  Press Enter to exit...');
  process.stdin.resume();
  process.stdin.on('data', () => process.exit(1));
});
