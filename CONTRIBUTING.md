# Contributing to EnzoChecker

Thank you for your interest in contributing

## How to Contribute

### Reporting Bugs

1. Check existing [Issues](https://github.com/EnzoDevs/EnzoChecker/issues) to avoid duplicates
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Your Node.js version (`node -v`)
   - Your OS (Windows / macOS / Linux)

### Suggesting Features

Open an issue with the `enhancement` label describing:
- What you'd like to see
- Why it would be useful
- Any implementation ideas you have

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork locally
3. Create a **feature branch**: `git checkout -b feature/my-feature`
4. Make your changes
5. **Test** your changes: `npm start`
6. **Commit** with a clear message: `git commit -m 'Add: my new feature'`
7. **Push** to your fork: `git push origin feature/my-feature`
8. Open a **Pull Request** against `main`

## Code Style

- Use **ES Modules** (`import`/`export`)
- Use **camelCase** for variables and functions
- Keep functions small and focused
- Add comments for complex logic
- Follow the existing code patterns in `src/`

## Commit Messages

Use clear, descriptive commit messages:

```
Add: new proxy validation method
Fix: rate limit handling for SOCKS5 proxies
Update: improve progress bar rendering
Remove: deprecated token rotation logic
```

## Questions?

Feel free to open an issue or reach out. Every contribution matters!
