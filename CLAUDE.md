# CLAUDE.md

Project context for Claude Code sessions working in this repository, or for
duplicating this pattern to a new election microsite.

## Project overview

This is a nonpartisan, single-page voter information site for the **May 2,
2026 City of Jersey Village, Texas** general election. It's built as vanilla
HTML, CSS, and JavaScript with flat JSON data files, hosted free on GitHub
Pages, and refreshed via reusable Claude.ai prompts. No build step. No
backend. No framework. The entire site loads from `index.html`, four JSON
files in `data/`, and five per-candidate JSON files in `data/social/`.

## Architecture

```
JerseyVillage2026/
├── index.html                       # Single-page app shell
├── style.css                        # All styles, mobile-first
├── app.js                           # Tab navigation, data loading, rendering
├── .nojekyll                        # Tells GitHub Pages to skip Jekyll
├── data/
│   ├── candidates.json              # All 5 candidates: bio, positions, contact
│   ├── election.json                # Dates, polling, voter info, disclaimer
│   ├── proposition-a.json           # Prop A details with for/against args
│   └── social/
│       ├── michael-brittain.json    # Recent Activity per candidate
│       ├── curt-beasley.json
│       ├── connie-rossi.json
│       ├── brian-mccauley.json
│       └── steven-gill.json
├── prompts/                         # Reusable Claude.ai refresh prompts
│   ├── recent-activity-request.md
│   ├── bio-update-request.md
│   ├── contact-update-request.md
│   └── positions-update-request.md
├── scripts/
│   ├── fetch-social.mjs             # Anthropic API script (currently manual-only)
│   └── package.json
├── .github/workflows/
│   ├── social-update.yml            # API workflow, cron disabled
│   └── deploy-pages.yml             # GitHub Actions Pages deploy (unused;
│                                    # site uses Settings → Pages → Deploy
│                                    # from a branch instead)
├── README.md
└── CLAUDE.md                        # This file
```

### Data flow

1. Browser loads `index.html`, which loads `style.css` and `app.js`.
2. `app.js` fetches `data/candidates.json`, `data/election.json`,
   `data/proposition-a.json` in parallel on `DOMContentLoaded`.
3. Race nav tabs are built from `candidatesData.races`. The first race is
   selected by default.
4. When a candidate is selected, four detail tabs render: **Bio**,
   **Positions**, **Contact**, **Recent Activity**.
5. The Recent Activity tab lazy-loads `data/social/{candidateId}.json` on
   first click and caches it in a `Map` for the session.

### The four content surfaces

| Tab | Source | Refreshed by | Cadence |
|---|---|---|---|
| Bio | `data/candidates.json` → `bio` | `Bio_Update_Request` prompt | Rare |
| Positions | `data/candidates.json` → `positions[]` | `Positions_Update_Request` prompt | Occasional |
| Contact | `data/candidates.json` → `contact` | `Contact_Update_Request` prompt | Occasional |
| Recent Activity | `data/social/{id}.json` → `summaries[]` | `Recent_Activity_Request` prompt | Weekly |

### The `id` join key

Every candidate has an `id` field (e.g. `michael-brittain`) that is the
single source of truth for joining all data. The same `id` appears in:
- `data/candidates.json` candidate object
- `data/social/{id}.json` filename and `candidateId` field
- The reusable prompts in `prompts/`
- Front-end state in `app.js`

When adding/removing candidates, update all four places consistently.

## Front-end conventions

- **Vanilla HTML/CSS/JS only.** No build step. No bundler. No framework.
  Open `index.html` in a browser (or `npx serve .` for a local server) and
  it works.
- **Semantic tabs** with `role="tab"`, `role="tablist"`, `role="tabpanel"`,
  `aria-selected`. Keyboard-accessible focus rings via `:focus-visible`.
- **Container width is locked.** `.container` has both `width: 100%` AND
  `max-width: var(--max-width)`. Without `width: 100%` it shrink-wraps to
  content and the card resizes between tabs. This was a real bug; don't
  remove `width: 100%`.
- **Persistent candidate header.** When you switch detail tabs (Bio →
  Positions → Contact → Recent Activity), only the panel below the tabs
  re-renders. The header (avatar, name, badges, race label) stays put to
  prevent visual jitter. See `renderCandidateHeader()` in `app.js`.
- **Avatar initials, not photos.** `.avatar` and `.avatar-lg` use the
  candidate's initials over `--color-primary-bg`. No image hosting needed.
- **Source rendering with platform pills.** In Recent Activity, each source
  link is a `.source-item` with a small `.source-platform` pill (Facebook /
  X / Web), the page title as the link text, and the hostname below it. The
  source list logic auto-strips trailing site names like "| Community
  Impact" from titles for cleaner display.
- **Detail tabs use `flex: 1`** so they're equal width and stable across
  candidates with different content lengths. Changing this will reintroduce
  visual jitter.
- **Detail panel has `min-height: 280px`** so the card doesn't collapse on
  short content like an empty Contact tab.
- **Bio renders as a single paragraph** with `.bio-paragraph` typography
  (max-width 68ch, line-height 1.8, 0.97rem). It honors explicit `\n\n`
  paragraph breaks in the source if you add them, but does NOT auto-split
  on sentences. (Auto-splitting was tried and broke on abbreviations like
  "D.R." Horton — see Gotchas below.)

## Manual content refresh workflow

The site is refreshed via four reusable Claude.ai prompts in `prompts/`.
This is the **preferred refresh path** because it's free, produces higher
quality output than the API workflow, and gives editorial control before
publishing.

### The four prompts

| Variable | File | Refreshes |
|---|---|---|
| `Recent_Activity_Request` | `prompts/recent-activity-request.md` | Recent Activity |
| `Bio_Update_Request` | `prompts/bio-update-request.md` | Bio |
| `Contact_Update_Request` | `prompts/contact-update-request.md` | Contact |
| `Positions_Update_Request` | `prompts/positions-update-request.md` | Positions |

### Workflow for any of them

1. Open the prompt file on GitHub or locally
2. Copy the prompt block
3. Paste into https://claude.ai with web search enabled
4. Wait ~2 minutes for the combined JSON response (one code block, all 5
   candidates)
5. Hand the JSON back to Claude Code (or hand-edit the relevant data file)
6. Commit and push — GitHub Pages auto-deploys within ~1 minute

Each prompt includes the **current state of the data as a baseline** so the
LLM knows what's already there and only updates with new verified info.
Each prompt forbids fabrication and instructs the LLM to preserve known
values that can't be improved.

## API workflow (currently disabled)

`scripts/fetch-social.mjs` is a Node.js script that calls the Anthropic API
with `web_search_20250305` and `web_fetch_20260309` tools to refresh
`data/social/*.json`. It's wired up to a GitHub Action at
`.github/workflows/social-update.yml`.

**The daily cron is currently commented out.** The workflow runs only via
manual `workflow_dispatch` from the Actions tab. The manual Claude.ai
workflow is preferred because:

1. Free vs. ~$0.20 per run (~$3-8/month at daily cadence)
2. Better summary quality from the chat-tier model
3. No rate limit headaches (see Gotchas)
4. Editorial review before publishing

If you re-enable the cron, fix the rate limit issue first (see Gotchas).

The script requires `ANTHROPIC_API_KEY` set as a GitHub repository secret.
The script reads it via `process.env.ANTHROPIC_API_KEY` automatically through
the `@anthropic-ai/sdk` client.

## Hard-won design decisions and gotchas

These are the things we discovered the hard way. Re-reading them will save
you hours.

### Facebook walls off post content from search engines
Brave Search (Anthropic's `web_search` backend) and Google can index that a
Facebook page exists, but they cannot read the actual posts on it. So even
when a candidate has an active campaign page, the model returns "page exists"
without any post content. **Don't promise "social media monitoring."** Frame
it as "Recent Activity" and broaden the search to news mentions, campaign
sites, and council records — content that IS fully indexed.

### Brave Search vs Google for niche local content
Brave's index is smaller than Google's for hyper-local political content. For
candidates with reasonable web presence (a campaign site, news Q&A coverage)
it works fine. For ultra-obscure candidates with only a Facebook page, it
will return very little. The manual Claude.ai prompts use whatever search
backend Claude.ai has, which has been better in practice for this use case.

### `web_fetch` requires `allowed_callers: ['direct']` on Sonnet 4
The `web_fetch_20260309` tool defaults to programmatic (agentic) tool
calling. Sonnet 4 does NOT support that mode. You must explicitly set
`allowed_callers: ['direct']` on the tool definition or you'll get a 400
error: "'claude-sonnet-4-20250514' does not support programmatic tool
calling."

```js
tools: [
  { type: 'web_search_20250305', name: 'web_search' },
  { type: 'web_fetch_20260309', name: 'web_fetch', allowed_callers: ['direct'] }
]
```

### Anthropic API rate limits bite hard with web search
Free-tier orgs have a 30,000 input tokens/minute limit. A single Sonnet 4
call with `web_search` enabled can burn through 5,000-10,000 input tokens
because the search results are returned to the model as context. Five
candidates back-to-back with a 2-second pause between them WILL hit the
rate limit. Real fix: ~60-second pauses between candidates, OR use the
manual Claude.ai workflow. We did the latter.

### Sentence splitting breaks on abbreviations
A regex like `/[^.!?]+[.!?]+(?:\s|$)/g` looks reasonable for splitting bio
text into sentences, but it fails on `D.R.` (D.R. Horton), `U.S.`, `Mrs.`,
`i.e.`, etc. The regex skips past the prefix and silently drops content. We
hit this on Curt Beasley's bio — "Curt Beasley is a Construction Area
Manager at D" disappeared because the first regex match was "R." from
"D.R.", and everything before it was discarded as between-match text.

**Don't auto-split bios on sentence boundaries.** Render as a single
paragraph with good typography. If you want visual paragraph breaks, add
explicit `\n\n` to the JSON source and the renderer will honor them.

### `.container` width gotcha
`.container { max-width: 960px; }` is NOT enough. Inside a flex column body,
containers shrink-wrap to their content width instead of stretching to the
max. Result: the candidate detail card resizes between tabs because the
content lengths differ.

Fix: add `width: 100%` alongside `max-width`:

```css
.container {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 16px;
}
```

### GitHub Pages config
The site is served via **Settings → Pages → Source: "Deploy from a branch"
→ Branch: `main` / `(root)`**. NOT via the GitHub Actions deployment
pattern. There's a `deploy-pages.yml` workflow file in `.github/workflows/`
from earlier experimentation, but it's not the active deploy path. Pushing
to `main` triggers Pages' built-in branch deploy.

### `.nojekyll` is required
GitHub Pages will try to process the site through Jekyll by default, which
can mangle vanilla HTML/CSS/JS sites (especially anything in `_*` folders
or with leading underscores). The empty `.nojekyll` file at the repo root
disables Jekyll. Don't delete it.

### Detail tabs need `flex: 1`
The tab strip below the candidate header (Bio | Positions | Contact |
Recent Activity) uses `.detail-tab { flex: 1; ... text-align: center; }` so
the four tabs are equal width. Without this they re-flow based on label
length and create visual jitter. Don't change to `flex: 0 0 auto` without
testing.

### Long workflow runs almost always mean rate limits or hung tool calls
If the GitHub Action runs more than ~3 minutes for 5 candidates, something
is wrong. The script should hard-cap each candidate at 90 seconds via the
Anthropic SDK `timeout` request option, with `maxRetries: 0`, and wrap each
candidate in try/catch so a single hung call doesn't kill the whole run.

## How to duplicate this for another election

1. **Clone the repo** to a new name (e.g. `JerseyVillage2028`,
   `CityXElection2027`)
2. **Update `README.md`** with the new election details and `CLAUDE.md` with
   the new candidate context. Keep the gotchas section as-is — it's still
   valid.
3. **Replace `data/candidates.json`** with the new candidates. Keep the
   schema:
   ```
   { races: [{ id, title, description, candidates: [{ id, name, photo,
     incumbent, unopposed, bio, positions: [{ topic, statement }],
     contact: { email, website, facebook, twitter } }] }] }
   ```
4. **Replace `data/election.json`** with new election dates, early voting
   dates, polling locations, registration deadline, voter ID requirements,
   and the nonpartisan disclaimer.
5. **Replace or remove `data/proposition-a.json`** if there's no ballot
   measure. If there is, follow the same `summary` / `details[]` /
   `forArguments[]` / `againstArguments[]` schema.
6. **Reset `data/social/*.json`** to empty seed state for the new
   candidates:
   ```json
   { "candidateId": "...", "lastUpdated": null, "lastChecked": null, "summaries": [] }
   ```
   Create one file per candidate, named `{id}.json`, in `data/social/`.
7. **Update each prompt in `prompts/`** with the new candidate list,
   background context, and known URLs. The prompt structure is the same;
   just swap the candidate-specific content.
8. **Update `scripts/fetch-social.mjs`** if you want to use the API
   workflow — the script reads the candidate list from `candidates.json`
   automatically, so no code changes needed unless you change the schema.
9. **Configure GitHub Pages** for the new repo: Settings → Pages → Deploy
   from a branch → main / (root). Make sure `.nojekyll` is at the repo root.
10. **Update `.github/workflows/social-update.yml`** trigger branch names if
    you're working on a different branch.
11. **Push to `main`.** Pages auto-deploys.

## Conventions Claude Code should follow when working in this repo

- **Full git merge flow on every change**: commit on the feature branch,
  push to the feature branch, push to main, checkout main, pull, merge,
  push, switch back to feature branch. Both branches stay in sync.
- **Commit messages**: imperative mood, concise subject, optional body
  explaining the why. Always include the session URL in the trailer.
- **Never bypass hooks** with `--no-verify` or skip GPG signing. If a hook
  fails, fix the underlying issue.
- **Manual prompt workflow is preferred** over the API workflow for all
  refreshes. Only re-enable the API cron if the user explicitly asks AND
  the rate limit issue is addressed.
- **Keep changes focused.** Don't refactor surrounding code, add features,
  or "improve" things that weren't part of the request.
- **Don't add comments** to explain self-evident code. Only comment where
  the logic isn't obvious (e.g. why `width: 100%` is needed on `.container`).
- **Trust the data files.** Don't add validation or error handling for
  scenarios that can't happen. The candidate JSON is hand-curated.
- **Read files before editing them.** The `Edit` tool requires it, and the
  files may have changed since you last looked.
- **Hand-curated data is sacred.** Don't auto-modify
  `data/candidates.json` from a script unless the user explicitly approves.
  The Recent Activity script is the only one that auto-modifies data files,
  and only the `data/social/` files.

## What NOT to do

- **Don't reintroduce automatic sentence splitting on bios.** It will break
  on `D.R. Horton`, `U.S.`, `Mrs.`, etc. Render as a single paragraph and
  honor explicit `\n\n` breaks only.
- **Don't re-enable the daily cron** without addressing the 30K-tokens/min
  rate limit. At minimum, increase the inter-candidate pause to 60 seconds.
- **Don't try to scrape Facebook posts.** Facebook walls off post content
  from all known search backends. Reframe as "Recent Activity" instead.
- **Don't combine the four prompts into one mega-prompt.** They have
  different output schemas, different refresh cadences, and different
  research focus areas. Keep them separate.
- **Don't remove `width: 100%` from `.container`.** The card will resize
  between tabs.
- **Don't remove `flex: 1` from `.detail-tab`** at desktop sizes (the
  responsive override is fine).
- **Don't delete `.nojekyll`.** Pages will process the site through Jekyll.
- **Don't add a build step.** This is intentional. Vanilla files served
  directly is the entire architecture.
- **Don't introduce a backend, database, or auth.** This is a static site.
  All "data" is hand-curated JSON.

## Tech stack at a glance

- **Front end:** Vanilla HTML, CSS, JavaScript (no build step)
- **Data:** Flat JSON files, hand-curated and refreshed via Claude.ai
- **Hosting:** GitHub Pages (free) via "Deploy from a branch" → main / root
- **Optional automation:** GitHub Actions + Anthropic API (currently
  disabled, manual-only)
- **Refresh workflow:** 4 reusable Claude.ai prompts in `prompts/`
- **Cost to run:** $0/month (manual workflow) to ~$3-8/month (if API cron
  is re-enabled)
