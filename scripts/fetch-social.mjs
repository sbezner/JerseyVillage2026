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
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    tools: [{ type: 'web_search', name: 'web_search' }],
    messages: [{
      role: 'user',
      content:
        `Search for recent social media posts and public activity by ${candidateName}, ` +
        `a candidate for Jersey Village, Texas city council in the May 2026 election. ` +
        `Check Facebook and X/Twitter for any recent posts. ` +
        `Provide a neutral, factual 2-3 sentence summary of their recent public posts ` +
        `related to the election or local city issues. ` +
        `If no recent activity is found, state that clearly. ` +
        `Include URLs to any specific posts you find.`
    }]
  });

  const textBlocks = response.content.filter(b => b.type === 'text');
  const summaryText = textBlocks.map(b => b.text).join('\n').trim();

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
    summary: summaryText || 'No social media activity found for this candidate today.',
    sources: sources.slice(0, 5)
  };
}

async function main() {
  await mkdir(SOCIAL_DIR, { recursive: true });

  const candidatesRaw = await readFile(join(DATA_DIR, 'candidates.json'), 'utf-8');
  const { races } = JSON.parse(candidatesRaw);
  const candidates = races.flatMap(r => r.candidates);

  for (const candidate of candidates) {
    const filePath = join(SOCIAL_DIR, `${candidate.id}.json`);

    let existing;
    try {
      existing = JSON.parse(await readFile(filePath, 'utf-8'));
    } catch {
      existing = { candidateId: candidate.id, lastUpdated: null, summaries: [] };
    }

    console.log(`Fetching social summary for ${candidate.name}...`);
    const newSummary = await fetchSocialSummary(candidate.name);

    existing.summaries.unshift(newSummary);
    existing.summaries = existing.summaries.slice(0, MAX_HISTORY);
    existing.lastUpdated = new Date().toISOString();

    await writeFile(filePath, JSON.stringify(existing, null, 2) + '\n');
    console.log(`Updated: ${candidate.name}`);

    // Pause between candidates to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('All social summaries updated.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
