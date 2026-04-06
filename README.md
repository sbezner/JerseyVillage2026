# Jersey Village 2026 Election Guide

Nonpartisan voter information site for the **May 2, 2026** City of Jersey Village general election.

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

## Recent Activity (manual refresh workflow)

The "Recent Activity" tab on each candidate page is refreshed manually using a
reusable Claude.ai prompt. This produces higher quality, more cited summaries
than the original automated API approach and costs $0 per refresh.

**See [`prompts/recent-activity-request.md`](prompts/recent-activity-request.md)** for the full prompt and usage instructions.

Quick workflow:
1. Open `prompts/recent-activity-request.md` and copy the prompt
2. Paste it into https://claude.ai (web search enabled)
3. Wait ~2 minutes for the combined JSON response
4. Hand the JSON back to Claude Code (or manually edit `data/social/*.json`)
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

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no build step)
- Flat JSON data files
- GitHub Pages hosting
- GitHub Actions + Anthropic API for daily social summaries
