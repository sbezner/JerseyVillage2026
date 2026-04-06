# Recent_Activity_Request

A reusable LLM prompt for refreshing the **Recent Activity** section of the
Jersey Village 2026 Election microsite.

## How to use

1. Open https://claude.ai (or any LLM with web search enabled)
2. Paste the prompt below as a single message
3. Wait for the response — one JSON code block containing all 5 candidates
4. Hand the JSON back to Claude Code (or hand-edit the 5 files in `data/social/`)
5. Commit and push — GitHub Pages auto-deploys within ~1 minute

## The Prompt

```
I need you to research 5 candidates running in the May 2, 2026 City of Jersey
Village, Texas city council election and produce one combined JSON object
summarizing each candidate's recent public activity. Use web search to find
current information.

Candidates:

1. Michael Brittain — City Council Place 1 (challenger, open seat).
   Background: Co-Founder/Managing Partner of Selrico Communications LLC
   (fiber optics), former Jersey Village firefighter and EMT-B.
   Known URL: https://www.facebook.com/profile.php?id=61588297770229

2. Curt Beasley — City Council Place 1 (challenger, open seat).
   Background: Construction Area Manager at D.R. Horton, 20+ years
   construction experience.
   Known URL: https://www.facebook.com/profile.php?id=61579467652553

3. Connie Rossi — City Council Place 4 (incumbent, running unopposed).
   Background: First elected May 2024 with 57.8%. Legal assistant for MUD
   law firm, former educator.
   Known URLs: https://connieforjv.org/ and
   https://www.facebook.com/connierossiforjv/

4. Brian McCauley — City Council Place 5 (challenger, open seat).
   Background: Senior arbitration manager, JV resident since 2011, served
   on 2024 Charter Review Commission.
   Known URL: https://www.facebook.com/brianmccauleyforjerseyvillage

5. Steven Gill — City Council Place 5 (challenger, open seat).
   Background: U.S. Director of Sales at BioZone Scientific, JV resident
   since 2011.
   Known URL: https://www.facebook.com/profile.php?id=61583721503741

For each candidate, search for and check their known Facebook page for:
- Recent statements in local news (especially Community Impact Newspaper
  coverage of Jersey Village)
- Campaign website or Facebook page activity
- Stated positions on local issues (City Hall remodel, fire district renewal
  Proposition A, flood mitigation, economic development, golf course,
  public safety)
- Public appearances, candidate forums, council meeting participation
- Any new campaign announcements or events

Produce ONE combined JSON object in this exact schema:

{
  "lastUpdated": "TODAY_ISO_TIMESTAMP",
  "lastChecked": "TODAY_ISO_TIMESTAMP",
  "candidates": {
    "michael-brittain": {
      "summary": "2-4 sentence neutral third-person summary",
      "sources": [
        { "platform": "web|facebook|x", "url": "...", "snippet": "Page title" }
      ]
    },
    "curt-beasley":   { "summary": "...", "sources": [ ... ] },
    "connie-rossi":   { "summary": "...", "sources": [ ... ] },
    "brian-mccauley": { "summary": "...", "sources": [ ... ] },
    "steven-gill":    { "summary": "...", "sources": [ ... ] }
  }
}

Rules:
- All 5 candidate keys must be present (use exact IDs above)
- platform must be one of: "web", "facebook", or "x"
- Set lastUpdated and lastChecked at the top level to today's full ISO
  timestamp
- Include 3-8 real, working source URLs per candidate
- Each snippet should be the actual page title (not just "Web" or "Source")
- Do NOT include inline URLs in the summary text — let the sources array
  handle attribution
- For each summary, write a 2-4 sentence neutral, factual third-person
  summary referencing sources naturally. No preamble, no meta-commentary.
  If no recent public activity is found for a candidate, set their summary
  to exactly: "No recent public activity was found for [Name]."
- Be neutral and factual. Do not fabricate quotes or claims.
- Output ONLY the single JSON code block — no commentary before or after.
```

## Workflow

| When | What |
|---|---|
| Weekly (or after a notable event) | Run this prompt in Claude.ai |
| ~2 minutes later | Receive one combined JSON block |
| Right after | Paste it into Claude Code or manually update `data/social/*.json` |
| Within 1 minute of commit | GitHub Pages auto-deploys, site is fresh |

## Adding/removing candidates

If the candidate roster changes (new election, runoff, withdrawal):

1. Update the **Candidates** section above with the new list and their known URLs
2. Update the JSON schema's `candidates` object keys to match
3. Add/remove the corresponding `data/social/{candidate-id}.json` files
4. Update `data/candidates.json` with the new candidate records
