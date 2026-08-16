import chalk from 'chalk';

const r = chalk.hex('#FF0000');
const dr = chalk.hex('#8B0000');
const gr = chalk.hex('#CC0000');
const dim = chalk.hex('#4A0000');
const w = chalk.white;
const g = chalk.gray;
const grn = chalk.hex('#00FF41');
const rd = chalk.hex('#FF1744');
const yl = chalk.hex('#FF6D00');
const mg = chalk.hex('#D500F9');

const INNER_WIDTH = 50;

export function getPad() {
  const cols = process.stdout.columns || 80;
  return ' '.repeat(Math.max(0, Math.floor((cols - INNER_WIDTH - 4) / 2)));
}

function row(content) {
  process.stdout.write('\r\x1b[K');
  console.log(getPad() + dr('│') + ' ' + content);
}

function rawRow(text) {
  const cols = process.stdout.columns || 80;
  const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((cols - clean.length) / 2));
  console.log(' '.repeat(pad) + text);
}

const BANNER_LINES = [
  dr('▄▄') + r('██') + dr('▄▄') + '          ' + dr('▄▄') + r('██') + dr('▄▄'),
  dr('▄') + r('██') + dr('▀▀') + r('██') + dr('▄') + '      ' + dr('▄') + r('██') + dr('▀▀') + r('██') + dr('▄'),
  r('██') + dr('▀    ▀') + r('██') + dr('▄  ▄') + r('██') + dr('▀    ▀') + r('██'),
  r('██') + dr('▀        ▀') + r('████') + dr('▀        ▀') + r('██'),
  '',
  r.bold('███████╗███╗   ██╗███████╗ ██████╗'),
  r.bold('██╔════╝████╗  ██║╚══███╔╝██╔═══██╗'),
  gr.bold('█████╗  ██╔██╗ ██║  ███╔╝ ██║   ██║'),
  gr.bold('██╔══╝  ██║╚██╗██║ ███╔╝  ██║   ██║'),
  dim.bold('███████╗██║ ╚████║███████╗╚██████╔╝'),
  dim.bold('╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝'),
  '',
  r.bold(' ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗███████╗██████╗'),
  r.bold('██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝██╔════╝██╔══██╗'),
  gr.bold('██║     ███████║█████╗  ██║     █████╔╝ █████╗  ██████╔╝'),
  gr.bold('██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ ██╔══╝  ██╔══██╗'),
  dim.bold('╚██████╗██║  ██║███████╗╚██████╗██║  ██╗███████╗██║  ██║'),
  dim.bold(' ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝'),
  '',
  g('B y    E n z o'),
];

export function showBanner() {
  console.log('\n\n');
  BANNER_LINES.forEach((l) => rawRow(l));
  console.log('\n');
}

export function printSeparator() {
  process.stdout.write('\r\x1b[K');
  console.log(getPad() + dr('─'.repeat(INNER_WIDTH + 2)));
}

export function logInfo(msg) {
  row(g('>') + ' ' + w(msg));
}

export function logSuccess(msg) {
  row(grn.bold('+') + ' ' + grn(msg));
}

export function logFail(msg) {
  row(rd('-') + ' ' + g(msg));
}

export function logWarn(msg) {
  row(yl('!') + ' ' + yl(msg));
}

export function logError(msg) {
  row(rd.bold('x') + ' ' + rd(msg));
}

export function logRateLimit(msg) {
  row(mg('~') + ' ' + mg(msg));
}

function padLabel(label, len = 12) {
  return (label + ' '.repeat(len)).slice(0, len);
}

export function printConfig(data) {
  printSeparator();
  row(w.bold('CONFIG'));
  printSeparator();
  row(g(padLabel('mode:')) + ' ' + r.bold(data.mode));
  if (data.type) row(g(padLabel('type:')) + ' ' + r.bold(data.type));
  if (data.pattern) row(g(padLabel('pattern:')) + ' ' + r.bold(data.pattern));
  if (data.length) row(g(padLabel('length:')) + ' ' + r.bold(data.length));
  row(g(padLabel('targets:')) + ' ' + r.bold(data.count));
  row(g(padLabel('tokens:')) + ' ' + (data.tokens > 0 ? grn.bold(data.tokens + ' active') : g('none (unauthed)')));
  row(g(padLabel('proxies:')) + ' ' + (data.proxies > 0 ? r.bold(data.proxies) : g('direct')));
  row(g(padLabel('threads:')) + ' ' + r.bold(data.threads));
  row(g(padLabel('webhook:')) + ' ' + (data.webhookActive ? grn.bold('active') : g('disabled')));
  printSeparator();
  console.log('');
}

export function printStats(stats) {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const cpm = stats.checked > 0 ? ((stats.checked / elapsed) * 60).toFixed(0) : 0;

  console.log('');
  printSeparator();
  row(w.bold('RESULTS'));
  printSeparator();
  row(g(padLabel('checked:')) + ' ' + w.bold(stats.checked));
  row(grn(padLabel('available:')) + ' ' + grn.bold(stats.hits));
  row(rd(padLabel('taken:')) + ' ' + rd.bold(stats.taken));
  row(yl(padLabel('errors:')) + ' ' + yl.bold(stats.errors));
  row(mg(padLabel('ratelimit:')) + ' ' + mg.bold(stats.rateLimited));
  row(g(padLabel('speed:')) + ' ' + w.bold(cpm) + '/min');
  row(g(padLabel('time:')) + ' ' + w.bold(elapsed) + 's');
  printSeparator();
  console.log('');
}

export function printProgress(current, total, stats) {
  const pct = total > 0 ? ((current / total) * 100).toFixed(1) : '0.0';
  const barLen = 20;
  const filled = Math.round((current / Math.max(total, 1)) * barLen);
  const bar = r('█'.repeat(filled)) + dim('░'.repeat(Math.max(0, barLen - filled)));

  const line =
    getPad() + dr('│') + ' ' + bar + ' ' + w.bold(pct + '%') + ' ' +
    g('|') + ' ' + grn(stats.hits + 'H') + ' ' +
    rd(stats.taken + 'T') + ' ' +
    yl(stats.errors + 'E') + ' ' +
    g(`[${current}/${total}]`);

  process.stdout.write('\r\x1b[K' + line);
}
