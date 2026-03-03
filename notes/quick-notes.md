---
title: Quick Notes
tags: [misc, quick]
created: 2025-03-15
author: Nid
description: Random snippets and reminders
pinned: true
---

# Quick Notes

A collection of quick snippets and things to remember.

## Keyboard Shortcuts I Always Forget

| App | Shortcut | Action |
|-----|----------|--------|
| VS Code | `Ctrl+Shift+P` | Command Palette |
| VS Code | `Ctrl+\`` | Toggle Terminal |
| Chrome | `Ctrl+Shift+I` | DevTools |
| Terminal | `Ctrl+R` | Search History |

## Useful One-Liners

```bash
# Find and kill process on port 3000
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9

# Count lines of code (excluding node_modules)
find . -name '*.ts' -not -path './node_modules/*' | xargs wc -l

# Pretty print JSON
cat data.json | python3 -m json.tool
```

## Things to Learn

- [ ] Rust basics
- [ ] WebAssembly
- [x] Docker multi-stage builds
- [x] GitHub Actions
- [ ] Kubernetes fundamentals

> [!NOTE]
> Check out the [Rust Book](https://doc.rust-lang.org/book/) for getting started with Rust.
