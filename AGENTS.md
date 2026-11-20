# Instructions for AI agents (Claude, Quokka, Muse, and others)

This repo is built mostly by AI agents working from GitHub issues. Two humans own it,
and **one of them is not a developer**. Write everything (issue comments, PR descriptions)
so a non-technical person can follow it.

## The app

Hydrate Together: a water-tracking web app (React + TypeScript + Vite), deployed to
GitHub Pages from `main`. Installable on phones as a PWA.

- `src/App.tsx`: the whole UI today. Split it into components in `src/components/` when it grows.
- `src/storage.ts`: **the only place that reads or writes user data.** Keep it that way:
  when sign-in and a database arrive, only this file (and new files it uses) should change.
- `src/reminders.ts`: drink reminders (browser notifications).
- `public/sw.js`: service worker (install + notification clicks; Web Push later).

Commands: `npm install`, `npm run dev`, `npm run build`, `npm run lint`.
`npm run build` must pass before you open a PR. CI checks it.

## How work flows

1. **Ideas become issues.** A human (or their agent) files an issue using the
   "💡 Feature idea" or "🐞 Something's broken" form. Plain-English is expected;
   it's your job to work out the technical details.
2. **Triage.** If an issue is vague, reply with a short, friendly question (at most 2–3).
   Don't ask about technical choices you can make yourself. Make them and say what you chose.
3. **Claim it.** Only pick up issues labeled `ready`. Before you start, comment
   `🤖 <agent name> is working on this` and add your label (`agent: claude`, `agent: quokka`, …).
   Never work on an issue another agent has claimed.
4. **Branch + PR.** Branch name: `<agent>/<issue-number>-short-name`.
   One issue per PR. Keep PRs small. The PR description must include:
   - `Closes #<number>`
   - **What changed** in 1–3 plain-English sentences (no jargon)
   - **How to try it**: steps a non-developer can follow on the preview/live site
   - Anything a human must do (e.g. "add a secret called X"). Also label the PR `needs human`.
5. **Review.** A human approves and merges. Agents never merge their own PRs and never push to `main`.
6. After merge, the site redeploys automatically (about 2 minutes).

## Rules

- Never commit secrets, API keys, or personal data. Use GitHub Secrets / env vars and
  document the name in the PR.
- If a task needs something only a human can do (creating an OAuth app, paying for a
  service, adding a secret), stop, explain exactly what's needed step by step, and label the
  issue `needs human`.
- Keep the app working offline for signed-out users: sign-in is optional, never required to log water.
- Mobile first: test layouts at 375px wide.
- Prefer free tiers and simple tools. Don't add a dependency for something a few lines can do.
- Be kind in comments. This is a fun project between partners. 💧
