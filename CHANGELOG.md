# Changelog

All notable changes to **EnzoChecker** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-16

### Added

- 🎲 **Random Username Generator** with 5 character modes (letters, numbers, mixed, letters+symbols, all)
- 🧩 **Pattern Generator** with `?`, `#`, `*` wildcard support
- 🎨 **Aesthetic Style Generator** (doubled, mirrored, dotted, underscored)
- 📄 **Wordlist Mode** — bulk check from `words.txt`
- 🌐 **Multi-Source Proxy Scraper** — 12+ providers, 13,500+ raw proxies
- ✅ **Cloudflare Trace Validation** — proxy testing without consuming Discord rate limits
- 🔄 **Smart Proxy Rotation** with per-proxy cooldown on rate limits
- 🔔 **Discord Webhook Alerts** with rich embeds on hits
- 💾 **Session Auto-Save** — checkpoint every 50 checks + `Ctrl+C` graceful save
- 🔁 **Session Resume** — pick up where you left off on restart
- ⚡ **Multi-Threaded Engine** — configurable concurrent workers (default: 20)
- 🛡️ **Token + Unauthed Support** — automatic fallback from pomelo-attempt to unauthed endpoint
- 🎯 **Precision-Aligned Dark Terminal UI** with gradient ASCII banner
- 📊 **Real-Time Progress Bar** with live stats (hits, taken, errors, speed)
- 📋 **Auto-Restart** after proxy scraping completes
