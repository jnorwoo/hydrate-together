# 💧 Hydrate Together

Track your water, get gentle reminders through the day, and (soon) cheer on your friends.

**Live app:** https://jnorwoo.github.io/hydrate-together/

👋 **New here and not a developer? Read [START-HERE.md](START-HERE.md).**
🤖 **AI agent? Read [AGENTS.md](AGENTS.md).**

## How this project works

Ideas go in as GitHub issues → an AI agent (Claude, Quokka, Muse…) picks one up → opens a pull
request → a human merges it → the site redeploys automatically.

## For developers

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
npm run lint
```

Stack: React + TypeScript + Vite, deployed to GitHub Pages. Data is stored in the browser
(`src/storage.ts`) until accounts are added.

### Agent setup (repo owner)

- **Claude:** run `claude setup-token` locally and save the token as the repo secret
  `CLAUDE_CODE_OAUTH_TOKEN` (Settings → Secrets and variables → Actions). Or run
  `/install-github-app` inside Claude Code. Then `@claude` mentions and the `agent: claude`
  label trigger `.github/workflows/claude.yml`.
- **Other agents (Quokka, Muse):** invite their GitHub account as a collaborator with
  *Write* access, or give them a fine-grained token scoped to this repo
  (Contents, Issues, Pull requests: read & write). Point them at `AGENTS.md`.
- Protect `main` (Settings → Branches) so changes land only through reviewed PRs.
