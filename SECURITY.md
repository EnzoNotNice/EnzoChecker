# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Contact directly via GitHub private messaging or email
3. Include details about the vulnerability and steps to reproduce
4. Allow reasonable time for a fix before public disclosure

## Sensitive Data

This project handles user tokens and webhook URLs. The following safeguards are in place:

- `tokens.txt`, `proxies.txt`, and `config.json` are listed in `.gitignore`
- A `config.example.json` is provided as a safe template (no secrets)
- Users are responsible for securing their own credentials

## Best Practices

- **Never** commit `tokens.txt` or `config.json` with real credentials
- Use the provided `config.example.json` as a starting point
- Keep your Discord tokens private and rotate them regularly
