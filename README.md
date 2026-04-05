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

## Social Media Summaries

A GitHub Action runs daily at 7 AM CDT to:
1. Call the Anthropic API with web search to find each candidate's recent social media activity
2. Write neutral AI summaries to `data/social/{candidate-id}.json`
3. Commit the updated files back to the repo

### Setup

Add your Anthropic API key as a GitHub repository secret named `ANTHROPIC_API_KEY`.

To trigger manually: Actions tab > "Update Social Summaries" > "Run workflow".

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no build step)
- Flat JSON data files
- GitHub Pages hosting
- GitHub Actions + Anthropic API for daily social summaries
