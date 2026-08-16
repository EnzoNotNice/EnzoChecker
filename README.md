<div align="center">

# EnzoChecker

**⚡ High-Performance Discord Username Availability Checker**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)]()

<br />

A blazing-fast, multi-threaded Discord username checker with proxy rotation, pattern generation, session auto-save, and Discord webhook alerts — all wrapped in a sleek dark terminal UI.

<br />

<img src="https://i.imgur.com/XWoLlpQ.png" alt="EnzoChecker Preview" width="100%" />

<br />

---

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎲 **Random Generator** | Generate usernames with letters, numbers, symbols, or any combination |
| 🧩 **Pattern Generator** | Custom patterns like `e??z`, `_???_`, `x##x` with wildcards |
| 🎨 **Aesthetic Styles** | Doubled (`aabb`), mirrored (`abba`), dotted, underscored styles |
| 📄 **Wordlist Mode** | Check usernames from a `words.txt` file |
| 🌐 **Auto Proxy Scraper** | Aggregates 13,500+ proxies from 12+ open-source APIs & repos |
| 🔔 **Discord Webhooks** | Instant rich embed alerts when available usernames are found |
| 💾 **Session Auto-Save** | Auto-saves progress every 50 checks & on `Ctrl+C` — resume anytime |
| 🔄 **Smart Proxy Rotation** | Automatic rate-limit detection & proxy cooldown management |
| ⚡ **Multi-Threaded** | Configurable thread count (default: 20 concurrent workers) |
| 🛡️ **Token + Unauthed** | Supports user tokens with automatic fallback to unauthed endpoint |

---

## 📁 Project Structure

```
EnzoChecker/
├── index.js              # Main entry point & controller
├── config.json           # Runtime configuration
├── package.json          # Dependencies & scripts
│
├── src/
│   ├── checker.js        # Discord API interaction layer
│   ├── generator.js      # Username generation engines
│   ├── loader.js         # File I/O & config management
│   ├── scraper.js        # Multi-source proxy aggregator
│   ├── session.js        # Session save/load/resume
│   ├── ui.js             # Terminal UI & banner renderer
│   └── webhook.js        # Discord webhook dispatcher
│
├── tokens.txt            # Discord tokens (one per line)
├── proxies.txt           # Proxy list (auto-populated by scraper)
├── words.txt             # Custom wordlist for Wordlist Mode
├── hits.txt              # ✅ Available usernames (output)
└── invalid.txt           # ❌ Taken usernames (output)
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) **v20+**

### Installation

```bash
# Clone the repository
git clone https://github.com/EnzoDevs/EnzoChecker.git
cd EnzoChecker

# Install dependencies
npm install
```

### Run

```bash
npm start
```

---

## ⚙️ Configuration

Edit `config.json` to customize behavior:

```jsonc
{
  "threads": 20,              // Concurrent worker threads
  "retryOnRateLimit": true,   // Auto-retry on 429
  "rateLimitDelay": 3000,     // Delay on rate limit (ms)
  "requestTimeout": 4500,     // Request timeout (ms)
  "useProxies": true,         // Enable proxy rotation
  "rotateTokens": true,       // Rotate between tokens
  "apiVersion": "v9",         // Discord API version
  "saveHits": true,           // Save available names to hits.txt
  "hitsFile": "hits.txt",     // Output file for available names
  "outputInvalid": true,      // Log taken names
  "invalidFile": "invalid.txt",
  "webhookUrl": "",           // Discord webhook URL
  "enableWebhook": false      // Toggle webhook alerts
}
```

---

## 🌐 Proxy Scraper

The built-in scraper aggregates fresh proxies from **12+ sources** including:

| Source | Protocol | Update Frequency |
|--------|----------|-----------------|
| ProxyScrape API | HTTP / SOCKS4 / SOCKS5 | Real-time |
| Komutan234 | HTTP / SOCKS4 / SOCKS5 | Every 2 min |
| Proxifly | HTTP / SOCKS5 | Every 5 min |
| Monosans | HTTP / SOCKS4 / SOCKS5 | Hourly |
| TheSpeedX | HTTP / SOCKS4 / SOCKS5 | Daily |
| Roosterkid | HTTPS / SOCKS4 / SOCKS5 | Hourly |
| KangProxy | HTTP / HTTPS / SOCKS | Frequent |
| Jetkai | HTTP / SOCKS4 / SOCKS5 | Frequent |
| Hookzof | SOCKS5 | Frequent |
| ShiftyTR | HTTP / SOCKS5 | Frequent |
| Zloi-User | HTTP / SOCKS5 | Frequent |
| ClarkeTM | HTTP | Daily |

> **Note:** Proxies are validated against Cloudflare Trace (`cloudflare.com/cdn-cgi/trace`) — Discord API rate limits are never consumed during scraping.

---

## 🔔 Webhook Alerts

Set up instant Discord notifications when available usernames are found:

1. Select option `[6]` from the main menu
2. Paste your Discord webhook URL
3. Receive rich embeds with username, timestamp, and live stats

---

## 💾 Session Auto-Resume

- Progress is saved automatically every **50 checks**
- On `Ctrl+C`, the current queue and stats are preserved
- On next startup, you'll be prompted to resume where you left off

---

## 📋 Usage Modes

### 1️⃣ Random Generator
Generate random usernames with configurable length and character sets:
- **Letters only** — `abc`
- **Numbers only** — `123`
- **Mixed** — `a1b2`
- **Letters + Symbols** — `a.b_c`
- **All characters** — `a-z`, `0-9`, `.`, `_`

### 2️⃣ Pattern Generator
Define templates with wildcards:
- `?` — random letter
- `#` — random digit
- `*` — random letter or digit

Example: `e??z` → `eabz`, `exyz`, `emnz` ...

### 3️⃣ Aesthetic Styles
- **Doubled** — `aabb`, `xxyy`
- **Mirrored** — `abba`, `xyyx`
- **Dotted / Underscored** — `a.b.c`, `x_y_z`

### 4️⃣ Wordlist Mode
Load custom usernames from `words.txt` (one per line).

### 5️⃣ Auto Proxy Scraper
Fetch and validate live proxies from open-source aggregators.

### 6️⃣ Webhook Setup
Configure Discord webhook URL for real-time hit notifications.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This tool is provided for **educational and research purposes only**. Use responsibly and in compliance with [Discord's Terms of Service](https://discord.com/terms). The developer is not responsible for any misuse of this software.

---

<div align="center">

**Built with 🖤 by [Enzo](https://github.com/EnzoDevs)**

</div>
