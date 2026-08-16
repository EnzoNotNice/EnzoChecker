import readline from 'readline';
import fs from 'fs';
import { getPad } from './ui.js';
const ROOT = process.cwd();

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '._';
const MIXED = LETTERS + NUMBERS;
const ALL_CHARS = LETTERS + NUMBERS + SYMBOLS;

function randChoice(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function randomUsername(length, charset) {
  let name = '';
  for (let i = 0; i < length; i++) {
    name += randChoice(charset);
  }
  if (name.startsWith('.')) name = randChoice(LETTERS) + name.slice(1);
  if (name.endsWith('.')) name = name.slice(0, -1) + randChoice(LETTERS);
  name = name.replace(/\.\./g, '.');
  return name;
}

export function generateFromPattern(pattern, count) {
  const set = new Set();
  let maxAttempts = count * 20;

  while (set.size < count && maxAttempts-- > 0) {
    const fixedChar = randChoice(LETTERS);
    let result = '';

    for (let i = 0; i < pattern.length; i++) {
      const ch = pattern[i];
      if (ch === '?') result += randChoice(LETTERS);
      else if (ch === '#') result += randChoice(NUMBERS);
      else if (ch === '*') result += randChoice(MIXED);
      else if (ch === '$') result += fixedChar;
      else result += ch;
    }

    if (result.startsWith('.')) continue;
    if (result.endsWith('.')) continue;
    if (result.includes('..')) continue;

    if (result.length >= 2 && result.length <= 32) {
      set.add(result);
    }
  }

  return [...set];
}

export function generateAesthetic(type, count) {
  const set = new Set();
  let maxAttempts = count * 30;

  while (set.size < count && maxAttempts-- > 0) {
    const a = randChoice(LETTERS);
    const b = randChoice(LETTERS);
    const c = randChoice(LETTERS);
    const n = randChoice(NUMBERS);

    let res = '';
    if (type === 'doubles') {
      res = `${a}${a}${b}${b}`;
    } else if (type === 'mirror') {
      res = `${a}${b}${b}${a}`;
    } else if (type === 'dot_split') {
      res = Math.random() > 0.5 ? `${a}.${b}${b}` : `${a}${a}.${b}`;
    } else if (type === 'under_split') {
      const subType = Math.floor(Math.random() * 3);
      if (subType === 0) res = `_${a}${b}${c}_`;
      else if (subType === 1) res = `${a}_${b}_${a}`;
      else res = `${a}${a}_${b}${b}`;
    } else if (type === 'letter_num') {
      res = Math.random() > 0.5 ? `${a}${a}${a}${n}` : `${a}${a}${n}${n}`;
    }

    if (res.length >= 2 && res.length <= 32 && !res.startsWith('.') && !res.endsWith('.')) {
      set.add(res);
    }
  }

  return [...set];
}

export function generateUsernames(count, length, type) {
  let charset = MIXED;
  if (type === 'letters') charset = LETTERS;
  else if (type === 'numbers') charset = NUMBERS;
  else if (type === 'mixed') charset = MIXED;
  else if (type === 'letters_sym') charset = LETTERS + SYMBOLS;
  else if (type === 'all') charset = ALL_CHARS;

  const set = new Set();
  const maxAttempts = count * 25;
  let attempts = 0;

  while (set.size < count && attempts++ < maxAttempts) {
    const name = randomUsername(length, charset);
    if (name.length >= 2 && name.length <= 32) {
      set.add(name);
    }
  }

  return [...set];
}

export function promptResumeSession(session) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));
    const p = getPad();

    (async () => {
      console.log('');
      const ans = await ask(
        p + `\x1b[38;2;139;0;0m│\x1b[0m  Unfinished session: \x1b[1m${session.remaining.length}\x1b[0m left | \x1b[1;32m${session.stats.hits}\x1b[0m hits\n` +
        p + `\x1b[38;2;139;0;0m│\x1b[0m  Resume? [Y/n]: `
      );
      rl.close();
      const resume = ans.toLowerCase() !== 'n';
      resolve(resume);
    })();
  });
}

export function promptMainMenu() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));
    const p = getPad();

    (async () => {
      console.log('');
      const modeAnswer = await ask(
        p + '\x1b[38;2;139;0;0m│\x1b[0m  Select Mode:\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[1]\x1b[0m Random Generator\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[2]\x1b[0m Pattern Generator\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[3]\x1b[0m Aesthetic Styles\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[4]\x1b[0m Wordlist Mode\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[5]\x1b[0m Auto-Scrape Proxies\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m    \x1b[1m[6]\x1b[0m Setup Discord Webhook\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m\n' +
        p + '\x1b[38;2;139;0;0m│\x1b[0m  > '
      );

      if (modeAnswer === '1' || !modeAnswer) {
        const typeAnswer = await ask(
          p + '\x1b[38;2;139;0;0m│\x1b[0m  Character type:\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [1] Letters\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [2] Numbers\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [3] Mixed\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [4] Letters + Symbols\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [5] All Combined\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m  > '
        );
        const map = { '1': 'letters', '2': 'numbers', '3': 'mixed', '4': 'letters_sym', '5': 'all' };
        const type = map[typeAnswer] || 'mixed';

        const lengthAnswer = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Length (2-32): ');
        let length = parseInt(lengthAnswer, 10);
        if (isNaN(length) || length < 2) length = 3;
        if (length > 32) length = 32;

        const countAnswer = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Amount: ');
        let count = parseInt(countAnswer, 10);
        if (isNaN(count) || count < 1) count = 100;

        rl.close();
        resolve({ mode: 'random', type, length, count });
      }

      else if (modeAnswer === '2') {
        const pattern = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Pattern (?=letter, #=num, *=any): ');
        const countAnswer = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Amount: ');
        let count = parseInt(countAnswer, 10);
        if (isNaN(count) || count < 1) count = 100;

        rl.close();
        resolve({ mode: 'pattern', pattern: pattern || 'e??z', count });
      }

      else if (modeAnswer === '3') {
        const styleAnswer = await ask(
          p + '\x1b[38;2;139;0;0m│\x1b[0m  Select Style:\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [1] Double pairs\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [2] Mirrored\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [3] Dot splits\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [4] Underscores\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m    [5] Letters + Numbers\n' +
          p + '\x1b[38;2;139;0;0m│\x1b[0m  > '
        );
        const styleMap = {
          '1': 'doubles',
          '2': 'mirror',
          '3': 'dot_split',
          '4': 'under_split',
          '5': 'letter_num',
        };
        const style = styleMap[styleAnswer] || 'doubles';

        const countAnswer = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Amount: ');
        let count = parseInt(countAnswer, 10);
        if (isNaN(count) || count < 1) count = 100;

        rl.close();
        resolve({ mode: 'aesthetic', style, count });
      }

      else if (modeAnswer === '4') {
        rl.close();
        resolve({ mode: 'wordlist' });
      }

      else if (modeAnswer === '5') {
        const targetAnswer = await ask(
          p + '\x1b[38;2;139;0;0m│\x1b[0m  Target amount: '
        );
        let target = parseInt(targetAnswer, 10);
        if (isNaN(target) || target < 0) target = 50;

        rl.close();
        resolve({ mode: 'scrape_proxies', targetCount: target });
      }

      else if (modeAnswer === '6') {
        const webhook = await ask(p + '\x1b[38;2;139;0;0m│\x1b[0m  Discord Webhook URL: ');
        rl.close();
        resolve({ mode: 'setup_webhook', webhookUrl: webhook });
      }
    })();
  });
}
