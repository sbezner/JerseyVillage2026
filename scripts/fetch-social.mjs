import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const SOCIAL_DIR = join(DATA_DIR, 'social');
const MAX_HISTORY = 14;

const client = new Anthropic();

async function fetchSocialSummary(candidateName) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:
      'You are a neutral, factual voter information assistant. When providing summaries, ' +
      'respond with ONLY the final summary text — no preamble, no "I searched for...", ' +
      'no "Based on my research...", no meta-commentary about the search process. ' +
      'Write in a journalistic third-person voice.',
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content:
        `Search for recent social media posts and public activity by ${candidateName}, ` +
        `a candidate for Jersey Village, Texas city council in the May 2026 election. ` +
        `Check Facebook and X/Twitter for recent posts related to the election or local issues.\n\n` +
        `Respond with ONLY a neutral, factual 2-3 sentence summary in third person. ` +
        `If no recent activity is found, respond with exactly: ` +
        `"No recent social media activity was found for ${candidateName}."`
    }]
  });

  // Take only the LAST text block — it's the final summary after all tool calls
  const textBlocks = response.content.filter(b => b.type === 'text');
  const summaryText = textBlocks.length > 0
    ? textBlocks[textBlocks.length - 1].text.trim()
    : '';

  const sources = [];
  for (const block of response.content) {
    if (block.type === 'web_search_tool_result' && block.content) {
      for (const result of block.content) {
        if (result.type === 'web_search_result' && result.url) {
          sources.push({
            platform: result.url.includes('facebook.com') ? 'facebook'
              : result.url.includes('twitter.com') || result.url.includes('x.com') ? 'x'
              : 'web',
            url: result.url,
            snippet: result.title || ''
          });
        }
      }
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    platforms: ['facebook', 'x'],
    summary: summaryText || `No recent social media activity was found for ${candidateName}.`,
    sources: sources.slice(0, 5)
  };
}

function isNoActivity(text) {
  if (!text) return true;
  const t = text.toLowerCase();
  return t.startsWith('no recent social media activity')
    || t.startsWith('no social media activity')
    || (t.includes('unable to find') && t.includes('social media'))
    || (t.includes('no recent') && t.includes('social media'));
}

async function main() {
  await mkdir(SOCIAL_DIR, { recursive: true });

  const candidatesRaw = await readFile(join(DATA_DIR, 'candidates.json'), 'utf-8');
  const { races } = JSON.parse(candidatesRaw);
  const candidates = races.flatMap(r => r.candidates);

  const nowIso = new Date().toISOString();

  for (const candidate of candidates) {
    const filePath = join(SOCIAL_DIR, `${candidate.id}.json`);

    let existing;
    try {
      existing = JSON.parse(await readFile(filePath, 'utf-8'));
    } catch {
      existing = { candidateId: candidate.id, lastUpdated: null, lastChecked: null, summaries: [] };
    }

    // Ensure new schema fields exist
    if (!('lastChecked' in existing)) existing.lastChecked = existing.lastUpdated;
    if (!Array.isArray(existing.summaries)) existing.summaries = [];

    console.log(`Fetching social summary for ${candidate.name}...`);
    const newSummary = await fetchSocialSummary(candidate.name);

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

  console.log('All social summaries updated.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
