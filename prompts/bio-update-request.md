# Bio_Update_Request

A reusable LLM prompt for refreshing the candidate **bios** in
`data/candidates.json` for the Jersey Village 2026 Election microsite.

## How to use

1. Open https://claude.ai (web search enabled)
2. Paste the prompt below as a single message
3. Wait for the response — one combined JSON code block with all 5 bios
4. Hand the JSON back to Claude Code (or hand-edit `data/candidates.json`)
5. Commit and push — GitHub Pages auto-deploys within ~1 minute

## The Prompt

```
I need you to research 5 candidates running in the May 2, 2026 City of Jersey
Village, Texas city council election and produce one combined JSON object
with strengthened, more substantive biographies for each one. Use web search
to find current, verifiable information.

The current bios are too thin — they focus almost entirely on occupation and
miss things like Jersey Village tenure, family ties, education, community
involvement beyond profession, motivation for running, and what humanizes the
candidate.

CURRENT BIOS (the baseline you are improving):

1. Michael Brittain — City Council Place 1 (challenger, open seat)
   Current bio: "Co-Founder, CEO, and Managing Partner of Selrico
   Communications LLC, a fiber optic and structured cabling company serving
   government clients including Harris County and the City of Houston.
   Co-founded the predecessor company (Cricket Fiber Services) in 2003,
   which merged into Selrico Communications in 2004. Former firefighter and
   EMT-B at the Jersey Village Fire Department. Has over 20 years of
   experience in construction and land development."
   Known URL: https://www.facebook.com/profile.php?id=61588297770229

2. Curt Beasley — City Council Place 1 (challenger, open seat)
   Current bio: "Construction Area Manager at D.R. Horton, one of the
   nation's largest homebuilders, based in Houston. Also associated with
   Spottswoode Homes LLC. Has over 20 years of experience in construction
   and land development. Resident of Jersey Village."
   Known URL: https://www.facebook.com/profile.php?id=61579467652553

3. Connie Rossi — City Council Place 4 (incumbent, running unopposed)
   Current bio: "Current City Council Member for Place 4, first elected in
   May 2024 with 57.8% of the vote. Legal assistant for a leading firm
   representing municipal utility districts (MUDs) and water districts.
   Former public school educator with 15 years of combined experience in
   education and legal assistance."
   Known URLs: https://connieforjv.org/ and
   https://www.facebook.com/connierossiforjv/

4. Brian McCauley — City Council Place 5 (challenger, open seat)
   Current bio: "Jersey Village resident with mediation experience.
   Participated in the 2024 Jersey Village Charter Review Commission. Plans
   to use his mediation background to foster fair, inclusive discussions on
   the council."
   Known URL: https://www.facebook.com/brianmccauleyforjerseyvillage
   Known additional info: senior arbitration manager at a large auto auction
   company; Jersey Village resident since 2011

5. Steven Gill — City Council Place 5 (challenger, open seat)
   Current bio: "Director of Sales for the United States at BioZone
   Scientific, a company specializing in air purification and UV photoplasma
   technology for hospitality, healthcare, entertainment, and transportation.
   Has years of experience working with city governments and global retail.
   Jersey Village resident since 2011."
   Known URL: https://www.facebook.com/profile.php?id=61583721503741

For each candidate, search for and add information on:
- How long they've lived in Jersey Village (specific year if findable)
- Family ties to the community (spouse, children, etc.)
- Education background (schools, degrees)
- Community involvement beyond their profession (boards, volunteer work,
  civic groups, churches, HOA participation, sports leagues, charities)
- Motivation for running / why this seat / what they say drew them in
- Specific accomplishments or notable roles
- Anything that humanizes them as a person beyond their job title

Look at:
- Their campaign Facebook pages (especially "About" sections)
- Connie Rossi's campaign website connieforjv.org
- Community Impact Newspaper Q&A articles about Jersey Village candidates
  from March 2026
- LinkedIn profiles
- The City of Jersey Village website (council member pages, board listings)
- Any local news mentions

Produce ONE combined JSON object in this exact schema:

{
  "lastUpdated": "TODAY_ISO_TIMESTAMP",
  "candidates": {
    "michael-brittain": { "bio": "Updated bio text..." },
    "curt-beasley":     { "bio": "..." },
    "connie-rossi":     { "bio": "..." },
    "brian-mccauley":   { "bio": "..." },
    "steven-gill":      { "bio": "..." }
  }
}

Rules for each bio:
- 4 to 7 sentences
- Third-person, neutral, factual journalistic voice
- Strictly factual — if a piece of information cannot be verified, leave it
  out rather than invent
- Do not fabricate quotes, family members, addresses, or specific dates
- Do not include URLs in the bio text
- Do not include political opinions or campaign positions (those live in a
  separate "positions" section of the site)
- Preserve the verified facts from the current bio when accurate
- Output ONLY the single JSON code block — no commentary before or after
```

## Workflow

| When | What |
|---|---|
| Whenever bio info changes | Run this prompt in Claude.ai |
| ~2 minutes later | Receive one combined JSON block |
| Right after | Hand the JSON to Claude Code (or manually edit `data/candidates.json`) |
| Within 1 minute of commit | GitHub Pages auto-deploys, Bio tabs are fresh |

## When to refresh

Bios change rarely. Refresh only when:

- A candidate publicly shares new biographical information
- You learn something new from a candidate forum, news article, or campaign event
- You spot a factual error in the current bio
- After significant Recent Activity research turns up new bio-worthy details

For ongoing daily/weekly updates of what candidates are *saying* and *doing*,
use **`Recent_Activity_Request`** instead — that one lives at
[`prompts/recent-activity-request.md`](recent-activity-request.md).

## Adding/removing candidates

If the candidate roster changes (new election, runoff, withdrawal):

1. Update the **Candidates** section above with the new list and their known URLs and current bios
2. Update the JSON schema's `candidates` object keys to match
3. Update `data/candidates.json` with the new candidate records
