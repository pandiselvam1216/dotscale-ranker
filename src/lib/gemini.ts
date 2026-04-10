export interface SearchResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function callGeminiWithRetry(apiKey: string, prompt: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error('No content in Gemini response');
      }
      return textContent;
    }

    if (response.status === 429) {
      // Rate limited — wait and retry
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.warn(`Gemini rate limited (attempt ${attempt + 1}/${retries}), waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    // Other errors — don't retry
    const errorData = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorData.slice(0, 200)}`);
  }

  throw new Error('Gemini API rate limited — please wait a moment and try again');
}

export async function fetchSearchResults(keyword: string): Promise<SearchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const prompt = `You are a search engine results simulator. For the given keyword, generate the top 20 realistic search engine results that would appear on Google.

Keyword: "${keyword}"

Return ONLY a valid JSON array of exactly 20 objects. Each object must have:
- "position": number (1-20)
- "title": string (realistic page title)
- "url": string (realistic full URL including https://)
- "snippet": string (realistic meta description snippet, 1-2 sentences)

Make the results realistic and diverse, including major brands, blogs, review sites, and relevant domains. Do not include any markdown formatting, code blocks, or extra text. Return ONLY the JSON array.`;

  const textContent = await callGeminiWithRetry(apiKey, prompt);

  // Parse the JSON response, handling potential markdown and conversational text
  let cleanedText = textContent.trim();
  const startIdx = cleanedText.indexOf('[');
  const endIdx = cleanedText.lastIndexOf(']');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanedText = cleanedText.substring(startIdx, endIdx + 1);
  } else {
    // Fallback markdown strip if brackets aren't found for some reason
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
  }

  try {
    const results: SearchResult[] = JSON.parse(cleanedText);
    return results.slice(0, 20).map((r, i) => ({
      position: i + 1,
      title: r.title || '',
      url: r.url || '',
      snippet: r.snippet || '',
    }));
  } catch {
    console.error('Failed to parse Gemini response:', cleanedText.slice(0, 200));
    throw new Error('Failed to parse search results — please try again');
  }
}

export function estimateTokensUsed(keyword: string): number {
  // Rough estimation: input prompt + output (~4000 tokens)
  return Math.ceil(keyword.length / 4) + 4000;
}
