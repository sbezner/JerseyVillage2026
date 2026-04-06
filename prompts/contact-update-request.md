# Contact_Update_Request

A reusable LLM prompt for refreshing the **contact information** for each
candidate in `data/candidates.json` for the Jersey Village 2026 Election
microsite.

## How to use

1. Open https://claude.ai (web search enabled)
2. Paste the prompt below as a single message
3. Wait for the response — one combined JSON code block with all 5 candidates' contact info
4. Hand the JSON back to Claude Code (or hand-edit `data/candidates.json`)
5. Commit and push — GitHub Pages auto-deploys within ~1 minute

## The Prompt

```
I need you to research 5 candidates running in the May 2, 2026 City of Jersey
Village, Texas city council election and produce one combined JSON object
with verified public contact information for each candidate. Use web search
to find current, verifiable links and addresses.

The Jersey Village 2026 Election microsite displays a "Contact" tab for each
candidate. The site supports four contact channels per candidate: email,
website, facebook, and twitter (X). Any of these may be null if no public,
verifiable value can be found.

CANDIDATES:

1. Michael Brittain — City Council Place 1 (challenger, open seat)
   Currently known: facebook = https://www.facebook.com/profile.php?id=61588297770229
   Background: Co-Founder of Selrico Communications LLC, former JV firefighter

2. Curt Beasley — City Council Place 1 (challenger, open seat)
   Currently known: facebook = https://www.facebook.com/profile.php?id=61579467652553
   Background: Construction Area Manager at D.R. Horton

3. Connie Rossi — City Council Place 4 (incumbent, running unopposed)
   Currently known: website = https://connieforjv.org/
                    facebook = https://www.facebook.com/connierossiforjv/
   Background: First elected 2024, legal assistant for MUD law firm

4. Brian McCauley — City Council Place 5 (challenger, open seat)
   Currently known: facebook = https://www.facebook.com/brianmccauleyforjerseyvillage
   Background: Senior arbitration manager, JV resident since 2011

5. Steven Gill — City Council Place 5 (challenger, open seat)
   Currently known: facebook = https://www.facebook.com/profile.php?id=61583721503741
   Background: U.S. Director of Sales at BioZone Scientific

For each candidate, search for and verify the following PUBLIC contact channels:

- email — a public campaign email address (e.g. candidate@theircampaign.org).
  ONLY include if it is publicly listed on a campaign page, official
  Community Impact Q&A, the City of Jersey Village website, or another
  verifiable public source. Do NOT include personal/private email addresses
  inferred from data brokers, ZoomInfo, or scraped sources.

- website — the candidate's official campaign website URL. Verify that the
  page actually loads and is the candidate's own campaign site (not a
  general listing page or news article).

- facebook — the candidate's official campaign Facebook page URL. Prefer
  named pages (e.g. facebook.com/connierossiforjv) over numeric profile IDs
  when both exist. Verify the page is actively associated with the candidate
  via campaign materials, not just a personal account.

- twitter — the candidate's official campaign X (formerly Twitter) handle as
  a full URL (e.g. https://x.com/handle). Same verification standard as
  Facebook.

Where to look:
- The candidate's known Facebook page (especially the "About" or "Contact"
  sections)
- Connie Rossi's campaign website connieforjv.org
- Community Impact Newspaper Q&A articles for Jersey Village candidates
  (March 2026)
- The City of Jersey Village official site (jerseyvillage.gov)
- Texas Ethics Commission filings if accessible
- LinkedIn profiles (only for verifying public links, not for harvesting
  private contact info)

Produce ONE combined JSON object in this exact schema:

{
  "lastUpdated": "TODAY_ISO_TIMESTAMP",
  "candidates": {
    "michael-brittain": {
      "contact": {
        "email":    null,
        "website":  null,
        "facebook": "https://www.facebook.com/...",
        "twitter":  null
      }
    },
    "curt-beasley":   { "contact": { "email": null, "website": null, "facebook": "...", "twitter": null } },
    "connie-rossi":   { "contact": { "email": null, "website": "...", "facebook": "...", "twitter": null } },
    "brian-mccauley": { "contact": { "email": null, "website": null, "facebook": "...", "twitter": null } },
    "steven-gill":    { "contact": { "email": null, "website": null, "facebook": "...", "twitter": null } }
  }
}

Rules:
- All 5 candidate keys must be present (use exact IDs above)
- Each candidate's `contact` object must include all 4 fields: email, website,
  facebook, twitter
- If a value cannot be publicly verified, set it to null — DO NOT guess,
  invent, infer from data brokers, or list a personal/private channel
- Preserve existing known values if you cannot find better ones (do not
  null out something that is already known unless you can verify it is
  no longer valid)
- For facebook URLs, prefer named pages over numeric profile.php?id= URLs
  when both exist for the same candidate
- For twitter, use the full https://x.com/handle URL format (not just the
  @handle)
- Do NOT include any other fields beyond the 4 listed
- Output ONLY the single JSON code block — no commentary before or after
```

## Workflow

| When | What |
|---|---|
| Whenever a candidate adds a new public channel | Run this prompt in Claude.ai |
| ~2 minutes later | Receive one combined JSON block |
| Right after | Hand the JSON to Claude Code (or manually edit `data/candidates.json`) |
| Within 1 minute of commit | GitHub Pages auto-deploys, Contact tabs are fresh |

## When to refresh

Contact info changes occasionally — typically when:

- A candidate launches a new campaign website
- A candidate creates a new Facebook page or X account
- A candidate publishes a public campaign email
- You spot a broken or outdated link on the live site
- After a candidate forum or news article that surfaces new contact channels

For ongoing daily/weekly updates of what candidates are *saying* and *doing*,
use **`Recent_Activity_Request`** instead — it lives at
[`prompts/recent-activity-request.md`](recent-activity-request.md).

For updating biographical details, use **`Bio_Update_Request`** — it lives at
[`prompts/bio-update-request.md`](bio-update-request.md).

## Privacy note

This prompt explicitly forbids harvesting personal contact info from data
brokers (ZoomInfo, BeenVerified, Spokeo, etc.) or inferring private channels.
The site only displays contact information that the candidate has chosen to
make public via a campaign page, official news Q&A, or government source.

## Adding/removing candidates

If the candidate roster changes (new election, runoff, withdrawal):

1. Update the **CANDIDATES** section above with the new list and their currently known contact info
2. Update the JSON schema's `candidates` object keys to match
3. Update `data/candidates.json` with the new candidate records
