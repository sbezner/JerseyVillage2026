# QA_Review_Request

A reusable LLM prompt for running a thorough quality-assurance review of the
live Jersey Village 2026 Election microsite. Paste this into Claude.ai (or
any LLM with web fetch) to get a prioritized issue report.

## How to use

1. Open https://claude.ai (web search and web fetch enabled)
2. Paste the prompt below as a single message
3. Wait for the response — a structured issue report organized by severity
4. Hand the report back to Claude Code, which will triage and fix
5. Commit and push — GitHub Pages auto-deploys within ~1 minute

## When to run

- Before a major content refresh to establish a baseline
- After any significant UI or content change
- After each Recent Activity / Bio / Positions / Contact refresh (to catch
  any neutrality or factual issues the other prompts may have introduced)
- Periodically in the final weeks before the election
- Any time you want a fresh pair of eyes on the site

## The Prompt

```
I need you to do a thorough QA review of a nonpartisan voter information
website for the May 2, 2026 City of Jersey Village, Texas city council
election. The site is live at:

https://sbezner.github.io/JerseyVillage2026/

Please use web search and web fetch to actually visit the site and inspect
its content, then walk through it like a real voter would. Report what you
find.

## About the site

It's a single-page static site (vanilla HTML/CSS/JS, no framework) that
displays information about 5 candidates in 3 races plus a ballot
proposition:

- Place 1: Michael Brittain vs. Curt Beasley (open seat)
- Place 4: Connie Rossi (incumbent, unopposed)
- Place 5: Brian McCauley vs. Steven Gill (open seat)
- Proposition A: Fire district / EMS 20-year renewal

The top navigation has 5 tabs: City Council Place 1, City Council Place 4,
City Council Place 5, Proposition A, and Election Info.

Within each race tab, clicking a candidate reveals 4 detail tabs: Bio,
Positions, Contact, and Recent Activity.

## QA checklist

Please check all of the following and report specific issues with direct
quotes or descriptions of what you see.

### 1. Content accuracy and completeness

- For each of the 5 candidates, does the Bio tab load with a substantive
  4-7 sentence biography? Does any bio appear truncated, cut off, start
  mid-sentence, or contain garbled text?
- For each candidate, does the Positions tab show 2-5 clearly stated
  positions with topic headings?
- For each candidate, does the Contact tab show at least one way to reach
  the candidate, or explicitly say no contact info is available?
- For each candidate, does the Recent Activity tab show either a
  substantive summary with source links OR a clear "no recent activity"
  empty state?
- Does each Recent Activity source link have a descriptive title (not just
  "Web" or "Source") and a visible hostname?

### 2. Navigation and interaction

- Can you switch between all 5 top-level tabs (Place 1, Place 4, Place 5,
  Proposition A, Election Info) without errors?
- Can you switch between candidates within a race?
- Can you switch between the 4 detail tabs (Bio, Positions, Contact, Recent
  Activity) without the card resizing, shifting, or flashing?
- Does the candidate header (avatar, name, race label) stay in place when
  you switch between detail tabs?
- Does the countdown badge in the header show a current, correct count of
  days until May 2, 2026?

### 3. Neutrality and nonpartisan tone

This is the most important check for a voter guide:

- Does the site show a clear nonpartisan disclaimer in the header and
  footer?
- Is every bio, position, and Recent Activity summary written in neutral,
  third-person, journalistic voice?
- Are any candidates described with loaded language, praise, or criticism
  that goes beyond factually reporting their stated positions?
- Does the Proposition A section present both "Arguments For" and
  "Arguments Against" with balanced, neutral framing?
- Are there any candidate positions that sound like campaign ad copy
  rather than neutral third-party description?

### 4. Design and UX

- Does the site look professional on desktop (1024px+ wide)?
- Does it look professional on mobile (375px wide)?
- Are the candidate cards the same width on every detail tab (no resizing
  when you click between Bio / Positions / Contact / Recent Activity)?
- Are the race navigation tabs easy to scan? Does the active tab stand out
  clearly?
- Is the typography readable? Any lines that are too long (over ~80
  characters) or too short?
- Do all links work and open correctly?
- Is there anything that looks broken, misaligned, or visually jarring?

### 5. Election information

On the Election Info tab:

- Is the election date (May 2, 2026) correct and prominent?
- Are the early voting dates shown?
- Are polling locations listed with addresses and hours?
- Is there a voter registration deadline and a link to register?
- Are the voter ID requirements clearly stated?

### 6. Proposition A

On the Proposition A tab:

- Is there a clear summary of what the proposition is about?
- Are there "Arguments For" and "Arguments Against" sections?
- Is the content balanced and neutral (not steering toward a yes or no
  vote)?
- Does it clearly explain this is a renewal (not a new tax)?

### 7. Accessibility spot-check

- Are the tabs keyboard-navigable (they should have role="tab" and
  aria-selected attributes)?
- Is there enough color contrast between text and backgrounds to read
  comfortably?
- Are interactive elements (tabs, buttons, links) clearly distinguishable
  from static text?

### 8. Factual sanity check

- Does each candidate's Bio match their Positions? (e.g., a candidate
  described as a firefighter should have positions that align with that
  background)
- Do the source links on Recent Activity actually load when clicked?
  Spot-check 2-3 of them.
- Are there any obvious factual errors, typos, broken dates, or misspelled
  names?

## Output format

Please organize your report as:

1. Overall impression (1 paragraph — does the site feel professional,
   trustworthy, and complete?)
2. Critical issues (anything that breaks trust, blocks a user, or violates
   neutrality — these need immediate fixes)
3. Medium issues (bugs, missing content, poor UX — should be fixed soon)
4. Minor issues and polish suggestions (typos, small visual tweaks,
   nice-to-haves)
5. Specific praise (what's working well)

For each issue, include:
- Where: which tab / candidate / section
- What: the specific problem, with a direct quote if it's text
- Why it matters: impact on user trust or usability
- Suggested fix: how to address it

Be thorough and honest. This is a public-facing voter information site, so
accuracy, neutrality, and professionalism matter a lot.
```

## Workflow

| When | What |
|---|---|
| Before major releases or after content refreshes | Run this prompt in Claude.ai |
| ~2-5 minutes later | Receive a structured issue report |
| Right after | Hand the report to Claude Code for triage and fixes |
| Within 1 minute of each fix commit | GitHub Pages auto-deploys |

## Relationship to the other prompts

This is the fifth named prompt in the `prompts/` directory. The other four
refresh content; this one validates that content:

- [`recent-activity-request.md`](recent-activity-request.md) — refresh Recent Activity
- [`bio-update-request.md`](bio-update-request.md) — refresh Bios
- [`contact-update-request.md`](contact-update-request.md) — refresh Contact info
- [`positions-update-request.md`](positions-update-request.md) — refresh Positions
- **This file** (`qa-review-request.md`) — QA the whole site

A good workflow is: run a refresh prompt → apply the JSON → run THIS prompt
to catch anything that regressed or needs polish → apply the fixes.

## Adding/removing candidates

If the candidate roster changes (new election, runoff, withdrawal):

1. Update the "About the site" section in the prompt with the new race/candidate list
2. No schema changes needed — the QA prompt returns prose, not JSON
