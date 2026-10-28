import 'server-only';

/**
 * Minimal, dependency-free Anthropic API client (just fetch — avoids adding
 * the full @anthropic-ai/sdk package when this project already needs to
 * install enough dependencies without network access to verify the lockfile;
 * this wrapper covers exactly the two call shapes this project needs).
 *
 * NEVER import this file into anything that ships to the browser — it reads
 * ANTHROPIC_API_KEY, which must only ever exist in the server/function
 * environment (Netlify environment variables), never in NEXT_PUBLIC_*.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-5-20250929';

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface AnthropicContentBlock {
  type: 'text' | 'document';
  text?: string;
  source?: { type: 'base64'; media_type: string; data: string };
}

export async function callAnthropic(params: {
  system: string;
  userContent: AnthropicContentBlock[];
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY غير مضبوط في متغيرات البيئة.');
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 2048,
      system: params.system,
      messages: [{ role: 'user', content: params.userContent }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`فشل الاتصال بخدمة الذكاء الاصطناعي (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const textBlock = json.content?.find((b: any) => b.type === 'text');
  if (!textBlock) throw new Error('رد غير متوقع من خدمة الذكاء الاصطناعي.');
  return textBlock.text as string;
}

/** Extracts a JSON object from a model response that may wrap it in prose
 * or a markdown code fence. Throws if nothing parseable is found — callers
 * must not silently fall back to fabricated data. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('تعذّر استخراج بيانات منظّمة من رد الذكاء الاصطناعي.');
  }
  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as T;
}
