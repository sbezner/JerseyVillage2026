import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const SOCIAL_DIR = join(DATA_DIR, 'social');
const MAX_HISTORY = 14;

const client = new Anthropic();

function classifyPlatform(url) {
  if (!url) return 'web';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'x';
  return 'web';
}

function buildKnownUrlsBlock(candidate) {
  const urls = [];
  const c = candidate.contact || {};
  if (c.website) urls.push(`- Campaign website: ${c.website}`);
  if (c.facebook) urls.push(`- Facebook campaign page: ${c.facebook}`);
  if (c.twitter) urls.push(`- X / Twitter: ${c.twitter}`);
  if (urls.length === 0) return '';
  return `\n\nKnown URLs to check directly using web_fetch:\n${urls.join('\n')}\n`;
}

async function fetchActivitySummary(candidate, raceTitle) {
  const knownUrls = buildKnownUrlsBlock(candidate);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:
      'You are a neutral, factual voter information assistant for a public election guide. ' +
      'Your job is to summarize what is publicly known about local candidates from news ' +
      'coverage, campaign materials, public statements, and any social media you can verify.\n\n' +
      'Respond with ONLY a 2-4 sentence summary in third-person journalistic voice. ' +
      'No preamble, no meta-commentary about your search process. ' +
      'Reference sources naturally (e.g., "In a March 2026 Community Impact Q&A, Rossi said..."). ' +
      'Do not fabricate quotes or claims. ' +
      'If you cannot find any recent public activity, respond exactly: ' +
      `"No recent public activity was found for ${candidate.name}."`,
    tools: [
      { type: 'web_search_20250305', name: 'web_search' },
      { type: 'web_fetch_20260309', name: 'web_fetch', allowed_callers: ['direct'] }
    ],
    messages: [{
      role: 'user',
      content:
        `Find and summarize recent public activity by ${candidate.name}, a candidate for ` +
        `Jersey Village, Texas ${raceTitle} in the May 2, 2026 election.\n\n` +
        `Look for:\n` +
        `- Recent statements in local news (especially Community Impact Newspaper Q&A articles ` +
        `about Jersey Village candidates)\n` +
        `- Campaign website content\n` +
        `- Stated positions on local issues (City Hall remodel, fire district renewal, ` +
        `flood mitigation, economic development, golf course, public safety)\n` +
        `- Public appearances, candidate forums, or council meeting participation\n` +
        `- Facebook or X/Twitter posts where findable` +
        knownUrls +
        `\nProvide a 2-4 sentence neutral summary of what they have been saying or doing recently. ` +
        `Reference the most informative sources naturally in the summary.`
    }]
  });

  // Take only the LAST text block — it's the final summary after all tool calls
  const textBlocks = response.content.filter(b => b.type === 'text');
  const summaryText = textBlocks.length > 0
    ? textBlocks[textBlocks.length - 1].text.trim()
    : '';

  // Extract sources from BOTH web_search and web_fetch tool result blocks
  const sources = [];
  const seenUrls = new Set();

  function addSource(url, title) {
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    sources.push({
      platform: classifyPlatform(url),
      url,
      snippet: title || ''
    });
  }

  for (const block of response.content) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const result of block.content) {
        if (result.type === 'web_search_result') {
          addSource(result.url, result.title);
        }
      }
    }
    if (block.type === 'web_fetch_tool_result' && block.content) {
      // web_fetch returns a single document
      const result = block.content;
      const url = result.url || result.document?.source?.url;
      const title = result.title || result.document?.title || '';
      addSource(url, title);
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    summary: summaryText || `No recent public activity was found for ${candidate.name}.`,
    sources: sources.slice(0, 8)
  };
}

function isNoActivity(text) {
  if (!text) return true;
  const t = text.toLowerCase();
  return t.startsWith('no recent public activity')
    || t.startsWith('no recent social media activity')
    || t.startsWith('no public activity')
    || (t.includes('unable to find') && (t.includes('public activity') || t.includes('social media')))
    || (t.includes('no recent') && (t.includes('public activity') || t.includes('social media')));
}

async function main() {
  await mkdir(SOCIAL_DIR, { recursive: true });

  const candidatesRaw = await readFile(join(DATA_DIR, 'candidates.json'), 'utf-8');
  const { races } = JSON.parse(candidatesRaw);

  // Build flat list with race title attached
  const flatCandidates = races.flatMap(r =>
    r.candidates.map(c => ({ candidate: c, raceTitle: r.title }))
  );

  const nowIso = new Date().toISOString();

  for (const { candidate, raceTitle } of flatCandidates) {
    const filePath = join(SOCIAL_DIR, `${candidate.id}.json`);

    let existing;
    try {
      existing = JSON.parse(await readFile(filePath, 'utf-8'));
    } catch {
      existing = { candidateId: candidate.id, lastUpdated: null, lastChecked: null, summaries: [] };
    }

    if (!('lastChecked' in existing)) existing.lastChecked = existing.lastUpdated;
    if (!Array.isArray(existing.summaries)) existing.summaries = [];

    console.log(`Fetching activity summary for ${candidate.name}...`);
    const newSummary = await fetchActivitySummary(candidate, raceTitle);

    const mostRecent = existing.summaries[0];
    const newIsNoActivity = isNoActivity(newSummary.summary);
    const lastWasNoActivity = mostRecent && isNoActivity(mostRecent.summary);

    // Dedup: if both new and most recent are "no activity", just bump lastChecked
    if (newIsNoActivity && lastWasNoActivity) {
      existing.lastChecked = nowIso;
      console.log(`  No new activity for ${candidate.name} — bumping lastChecked only`);
    } else {
      existing.summaries.unshift(newSummary);
      existing.summaries = existing.summaries.slice(0, MAX_HISTORY);
      existing.lastUpdated = nowIso;
      existing.lastChecked = nowIso;
      console.log(`  Updated ${candidate.name} with new summary`);
    }

    await writeFile(filePath, JSON.stringify(existing, null, 2) + '\n');

    // Pause between candidates to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('All activity summaries updated.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
