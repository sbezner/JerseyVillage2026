# Jersey Village 2026 Election Guide

Nonpartisan voter information site for the **May 2, 2026** City of Jersey Village general election. Live at **https://sbezner.github.io/JerseyVillage2026/**.

## Architecture at a glance

A single-page static site built with vanilla HTML, CSS, and JavaScript — no build step, no framework, no backend. Candidate and election content lives in flat JSON files in `data/`. Content is refreshed manually via four reusable Claude.ai prompts in `prompts/` (free and editorially controlled). The site is hosted free on GitHub Pages and auto-deploys on every push to `main`.

For the full architecture, conventions, design decisions, and a step-by-step guide to duplicating this pattern for another election, see **[`CLAUDE.md`](CLAUDE.md)**.

## Races

- **Place 1:** Michael Brittain vs. Curt Beasley
- **Place 4:** Connie Rossi (unopposed)
- **Place 5:** Brian McCauley vs. Steven Gill
- **Proposition A:** Fire District 20-year renewal

## Running Locally

Open `index.html` in a browser. For JSON fetching to work you need a local server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Updating Candidate Data

Edit `data/candidates.json` with candidate bios, positions, and contact info. The front end reads this file at page load.

## Reusable Claude.ai Prompts

Four named prompts live in `prompts/` for refreshing site content via Claude.ai (free, high quality, editorially controlled):

- **[`prompts/recent-activity-request.md`](prompts/recent-activity-request.md)** — refresh the Recent Activity tab for all 5 candidates in one shot. Use weekly or after notable events.
- **[`prompts/bio-update-request.md`](prompts/bio-update-request.md)** — strengthen the Bio tab for all 5 candidates in one shot. Use occasionally when new biographical info surfaces.
- **[`prompts/contact-update-request.md`](prompts/contact-update-request.md)** — refresh the Contact tab (email, website, facebook, twitter) for all 5 candidates. Use when a candidate adds a new public channel.
- **[`prompts/positions-update-request.md`](prompts/positions-update-request.md)** — refresh the Positions tab (stances on local issues) for all 5 candidates. Use after candidate forums, debates, or new news articles.

All four follow the same workflow:
1. Open the prompt file and copy the prompt
2. Paste it into https://claude.ai (web search enabled)
3. Wait ~2 minutes for the combined JSON response
4. Hand the JSON back to Claude Code (or manually edit the relevant data file)
5. Commit and push — GitHub Pages auto-deploys

## Automated Social Summaries (currently manual-only)

A GitHub Action exists at `.github/workflows/social-update.yml` that can call
the Anthropic API to fetch summaries. The daily cron is currently disabled —
the workflow runs only via manual trigger. The manual Claude.ai workflow above
is the preferred path because of higher quality output and zero cost.

### Setup (only needed if you want to re-enable the API workflow)

Add your Anthropic API key as a GitHub repository secret named `ANTHROPIC_API_KEY`.

To trigger manually: Actions tab > "Update Social Summaries" > "Run workflow".

To re-enable the daily cron: uncomment the `schedule:` block in
`.github/workflows/social-update.yml`.

## Reusing this for another election

This site is designed to be cloned and adapted for any small-scale election microsite. The high-level steps:

1. Clone the repo and rename it
2. Update `data/candidates.json` with the new candidates (keep the schema)
3. Update `data/election.json` with new dates and polling info
4. Replace or remove `data/proposition-a.json` if there's no ballot measure
5. Reset `data/social/*.json` to seed state for the new candidates
6. Update each prompt in `prompts/` with the new candidate list and context
7. Update `CLAUDE.md` with the new project context (keep the gotchas section)
8. Configure GitHub Pages and push to `main`

See **[`CLAUDE.md`](CLAUDE.md)** for the full duplication guide, including all the architectural conventions, hard-won design decisions, and gotchas you'll want to know about (Facebook walls, Brave Search limitations, the abbreviation-splitting bug, container width gotcha, etc.).

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no build step)
- Flat JSON data files
- GitHub Pages hosting (Deploy from a branch → main / root)
- Optional: GitHub Actions + Anthropic API for automated social summaries (currently manual-only)
