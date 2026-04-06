# Positions_Update_Request

A reusable LLM prompt for refreshing the **positions on issues** for each
candidate in `data/candidates.json` for the Jersey Village 2026 Election
microsite.

## How to use

1. Open https://claude.ai (web search enabled)
2. Paste the prompt below as a single message
3. Wait for the response — one combined JSON code block with all 5 candidates' positions
4. Hand the JSON back to Claude Code (or hand-edit `data/candidates.json`)
5. Commit and push — GitHub Pages auto-deploys within ~1 minute

## The Prompt

```
I need you to research 5 candidates running in the May 2, 2026 City of Jersey
Village, Texas city council election and produce one combined JSON object
with their current public positions on local issues. Use web search to find
verifiable, neutral, factual content.

Each "position" describes where a candidate stands on a specific local issue
(public safety, fiscal responsibility, infrastructure, transparency, etc.).
The Jersey Village 2026 Election microsite displays these on a "Positions"
tab for each candidate.

CANDIDATES (with their CURRENT positions as a baseline you are verifying,
expanding, or replacing):

1. Michael Brittain — City Council Place 1 (challenger, open seat)
   Background: Co-Founder of Selrico Communications LLC, former JV firefighter
   Current positions:
   - Emergency Services & Public Safety: "Top priority. Believes strong
     economic development is required to ensure Police, Fire, and EMS are
     properly funded through local business sales tax revenue. Draws on his
     background as a former Jersey Village firefighter and EMT."
   - Growth & Infrastructure: "Sees balancing economic growth with
     infrastructure needs while protecting the character of the community as
     the biggest challenge facing Jersey Village."
   - Transparency & Communication: "Will work with City Council and city
     secretary to maintain the dedicated communications director, support
     open communications with residents, encourage public participation in
     meetings, and ensure decisions and financial information are
     communicated across multiple platforms."

2. Curt Beasley — City Council Place 1 (challenger, open seat)
   Background: Construction Area Manager at D.R. Horton, 20+ years experience
   Current positions:
   - Fiscal Responsibility: "Top priority. Plans to use his land development
     and construction experience to oversee the City Hall remodel and the
     building of a city pool. Has raised serious concerns about city
     overspending — cites the golf clubhouse/convention center project, which
     he says exceeded its $9 million budget by $5 million. Wants to request
     a forensic accountant and construction professional to review payments
     on that project."
   - City Spending & Vendor Processes: "Believes the processes the city uses
     to find vendors for construction projects are 'severely flawed' and
     need to be fixed. Says the current City Hall remodel estimate is more
     than triple what it should cost. Stopping overspending is a key focus."
   - Financial Reserves & Maintenance: "Will work with City Council to
     maintain strong financial reserves while prioritizing preventive
     maintenance and infrastructure projects before issues arise. Focuses on
     costs, return on investment, and long-term data when making decisions."

3. Connie Rossi — City Council Place 4 (incumbent, running unopposed)
   Background: First elected May 2024, legal assistant for MUD law firm,
   former public school educator
   Current positions:
   - Public Safety: "Will continue supporting JVPD, Fire Department, and EMS.
     Supports budgets that make emergency response teams efficient,
     preemptive, and valued. Will reinforce efforts to keep Jersey Village
     one of the safest communities in the county."
   - Infrastructure & Flooding: "Supports street drainage repair projects,
     storm water drainage and flood mitigation to prevent future flooding.
     Willing to collaborate with neighboring municipalities. Supports
     improvements to streets, sidewalks, and underground infrastructure.
     Advocates for a preventative maintenance plan for the city's water and
     wastewater facilities."
   - Economic Development: "Plans to evaluate Jersey Village's current and
     future economic needs and work to empower citizen engagement for
     profitable and agreeable outcomes. Recognizes the city depends on fresh
     and innovative approaches to unlocking future potential for revenue and
     financial growth."
   - Community Engagement & Transparency: "Encourages resident involvement
     and collaborative engagement between residents and City Council. Will
     improve government transparency and proactively deliver essential
     information to residents."

4. Brian McCauley — City Council Place 5 (challenger, open seat)
   Background: Senior arbitration manager, JV resident since 2011, served on
   2024 Charter Review Commission
   Current positions:
   - Pay-As-You-Go Fiscal Policy: "Top priority. Wants to phase in a Fort
     Worth-style Pay-As-You-Go (PayGo) model over 5-10 years for
     infrastructure and capital projects — paying with current revenues,
     reducing unnecessary debt, protecting reserves, and preventing future
     tax hikes. Goal is long-term fiscal health while maintaining Jersey
     Village's small-town charm and quality of life."
   - Transparency & Accountability: "Will build on Jersey Village's
     foundation of open meetings, posted council packets, and financial
     transparency. Plans to be readily accessible to residents, publicly
     share positions and reasoning on social media, and encourage open
     dialogue."

5. Steven Gill — City Council Place 5 (challenger, open seat)
   Background: U.S. Director of Sales at BioZone Scientific, JV resident
   since 2011
   Current positions:
   - Economic Development: "Top priority is bringing new businesses to
     Jersey Village and supporting existing ones. Wants to help create an
     Economic Development Committee to assist the city. Notes that sales
     tax revenue from local businesses helps reduce property taxes."
   - Fire Department & Services: "Views fire department costs and ensuring
     adequate tax revenue to continue providing a high level of service as
     a major challenge facing the city."
   - Transparency: "Notes that Jersey Village has obtained five of the six
     Texas Comptroller transparency stars. Believes the city can improve on
     social media outreach and resident engagement to earn the sixth."

For each candidate, search for and verify their positions using:
- Community Impact Newspaper Q&A articles for Jersey Village candidates
  (especially the March 2026 Q&A series)
- The candidate's campaign website (where one exists)
- The candidate's campaign Facebook page (especially "About" sections and
  recent posts laying out positions)
- Council meeting minutes (for the incumbent, Connie Rossi)
- Local news coverage of Jersey Village candidate forums or debates
- Charter Review Commission documents (for Brian McCauley)
- The City of Jersey Village website

For each candidate, produce a `positions` array of 2 to 5 entries. Each
position should be a clearly stated stance on a specific local issue. Local
issues to consider include: public safety / police / fire / EMS funding,
the City Hall remodel, the city pool, the golf course / convention center,
the November 2025 bond results, fire district renewal (Proposition A),
flood mitigation and drainage, economic development, sales tax revenue,
property taxes, transparency, water/wastewater infrastructure,
parks and recreation, traffic congestion, vendor selection processes, and
fiscal management approaches like Pay-As-You-Go.

Produce ONE combined JSON object in this exact schema:

{
  "lastUpdated": "TODAY_ISO_TIMESTAMP",
  "candidates": {
    "michael-brittain": {
      "positions": [
        {
          "topic": "Public Safety",
          "statement": "Neutral 1-3 sentence description of his stance..."
        },
        {
          "topic": "Another Topic",
          "statement": "..."
        }
      ]
    },
    "curt-beasley":   { "positions": [ { "topic": "...", "statement": "..." } ] },
    "connie-rossi":   { "positions": [ { "topic": "...", "statement": "..." } ] },
    "brian-mccauley": { "positions": [ { "topic": "...", "statement": "..." } ] },
    "steven-gill":    { "positions": [ { "topic": "...", "statement": "..." } ] }
  }
}

Rules:
- All 5 candidate keys must be present (use exact IDs above)
- Each candidate must have between 2 and 5 position entries
- `topic` must be a short noun phrase, ideally 2-5 words (e.g. "Public
  Safety", "Pay-As-You-Go Fiscal Policy", "Infrastructure & Flooding")
- `statement` must be 1 to 3 sentences in third-person, neutral,
  journalistic voice
- Do NOT include URLs in the topic or statement text
- Do NOT include political opinions, endorsements, or attacks
- Where a candidate has clearly identified a "top priority", note that
  naturally in the relevant statement (e.g. "Top priority. Wants to...")
- Preserve the verified facts from the current positions when accurate;
  expand them with new information you find; replace them only when you
  can show the candidate has changed their position
- If a current position cannot be independently verified anymore, you may
  drop it, but err on the side of keeping the existing statement and only
  removing positions when there is clear evidence they no longer apply
- Do not fabricate quotes or invent positions the candidate has not stated
- Output ONLY the single JSON code block — no commentary before or after
```

## Workflow

| When | What |
|---|---|
| After a candidate forum, debate, or new Q&A article | Run this prompt in Claude.ai |
| ~2 minutes later | Receive one combined JSON block |
| Right after | Hand the JSON to Claude Code (or manually edit `data/candidates.json`) |
| Within 1 minute of commit | GitHub Pages auto-deploys, Positions tabs are fresh |

## When to refresh

Positions change occasionally. Refresh when:

- A candidate publishes a new platform statement on their campaign site or
  Facebook page
- A new local news article surfaces a stated position
- A candidate forum, debate, or town hall covers new ground
- You spot a factual error in a current position
- For the incumbent (Connie Rossi), after a notable council vote that
  reveals or clarifies her stance

For ongoing daily/weekly updates of what candidates are *saying* and *doing*,
use **`Recent_Activity_Request`** instead — it lives at
[`prompts/recent-activity-request.md`](recent-activity-request.md).

For updating biographical details, use **`Bio_Update_Request`** — at
[`prompts/bio-update-request.md`](bio-update-request.md).

For updating contact information, use **`Contact_Update_Request`** — at
[`prompts/contact-update-request.md`](contact-update-request.md).

## Adding/removing candidates

If the candidate roster changes (new election, runoff, withdrawal):

1. Update the **CANDIDATES** section above with the new list and their
   currently-known positions
2. Update the JSON schema's `candidates` object keys to match
3. Update `data/candidates.json` with the new candidate records
