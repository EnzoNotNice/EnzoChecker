import fs from 'fs';
import path from 'path';
import { getAppRoot } from './loader.js';

const ROOT = getAppRoot();
const SESSION_FILE = path.resolve(ROOT, 'session.json');

export function hasSession() {
  if (!fs.existsSync(SESSION_FILE)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    return Array.isArray(data.remaining) && data.remaining.length > 0;
  } catch {
    return false;
  }
}

export function loadSession() {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    return data;
  } catch {
    return null;
  }
}

export function saveSession(remaining, stats, configDisplay, totalOriginal) {
  try {
    const data = {
      remaining,
      totalOriginal: totalOriginal || remaining.length,
      stats: {
        checked: stats.checked || 0,
        hits: stats.hits || 0,
        taken: stats.taken || 0,
        errors: stats.errors || 0,
        rateLimited: stats.rateLimited || 0,
      },
      configDisplay: configDisplay || {},
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
  }
}

export function clearSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch {
  }
}
