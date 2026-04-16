export interface SearchResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export interface Attribution {
  sentence: string;
  sourcePosition: number;
  contributionScore: number;
}

export interface AIOverview {
  summary: string;
  attributions: Attribution[];
}

export interface SearchResponse {
  results: SearchResult[];
  aiOverview: AIOverview;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function callGeminiWithRetry(apiKey: string, prompt: string, retries = 3): Promise<string> {
  const systemInstruction = `You are a specialized search engine results simulator and content attribution auditor.
Return a single JSON object containing:
1. "results": An array of 15 highly realistic search results.
2. "aiOverview": A 2-3 sentence summary synthesized from these results.
3. "attributions": An array mapping each sentence of the summary to a specific search result ("sourcePosition" 1-15) and calculating its "contributionScore" (percentage of influence).

Return ONLY valid JSON.`;
  
  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          system_instruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error('Empty AI response');
        return textContent;
      }

      const retriable = [429, 500, 503, 504];
      if (retriable.includes(response.status)) {
        const waitTime = Math.pow(1.5, attempt) * 1000 + 500;
        console.warn(`Gemini API Busy (${response.status}) - Retry ${attempt + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText.slice(0, 50)}`);
    } catch (err: any) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('The AI service is currently at peak capacity. Please try again in 30 seconds.');
}

export async function fetchSearchResults(keyword: string): Promise<SearchResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('API Key missing');

  const prompt = `Simulate exactly 15 highly realistic Google search results for the keyword: "${keyword}".
  
### Requirements:
- Use your knowledge of REAL websites, institutions, and platforms relevant to this specific keyword.
- Include a mix of official sites, authoritative guides, and relevant news/blogs.
- Generate a "summary" of the best answer for "${keyword}" at the top.
- Provide "attributions" for each sentence in that summary, linking them to specific positions in the 15 results.`;

  const textContent = await callGeminiWithRetry(apiKey, prompt);

  let jsonString = textContent.trim();
  const start = jsonString.indexOf('{');
  const end = jsonString.lastIndexOf('}');
  if (start !== -1 && end !== -1) jsonString = jsonString.substring(start, end + 1);

  const data = JSON.parse(jsonString);
  
  if (data.results && Array.isArray(data.results)) {
    return {
      results: data.results.slice(0, 15).map((r: any, i: number) => ({
        position: i + 1,
        title: String(r.title || 'Untitled Result'),
        url: String(r.url || '#'),
        snippet: String(r.snippet || 'No description.'),
      })),
      aiOverview: {
        summary: String(data.aiOverview?.summary || 'No summary available.'),
        attributions: Array.isArray(data.aiOverview?.attributions || data.attributions) 
          ? (data.aiOverview?.attributions || data.attributions).map((a: any) => ({
              sentence: String(a.sentence || ''),
              sourcePosition: Number(a.sourcePosition || 0),
              contributionScore: Number(a.contributionScore || 0),
            }))
          : []
      }
    };
  }

  throw new Error('Failed to parse AI results.');
}

function getMockRankFeedback(keyword: string, targetUrl: string, position: number | null): string {
  if (position) {
    return `Your website is performing well for "${keyword}", ranking at position #${position}. To improve further, focus on optimizing your title tags and building high-quality backlinks from relevant domains.`;
  }
  return `Your website "${targetUrl}" was not found in the top results for "${keyword}". Consider improving your on-page SEO, increasing content depth, and ensuring your site is mobile-friendly to boost rankings.`;
}

export async function generateRankCheckFeedback(keyword: string, targetUrl: string, position: number | null, results: SearchResult[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return getMockRankFeedback(keyword, targetUrl, position);

  const status = position ? `found at position #${position}` : "not found in the top 15 results";
  const prompt = `Provide 1-2 sentences of professional SEO advice for "${targetUrl}" regarding "${keyword}". Status: ${status}. Be concise and professional.`;

  try {
    return await callGeminiWithRetry(apiKey, prompt, 1);
  } catch (err) {
    console.warn('Gemini feedback failed, using mock:', err);
    return getMockRankFeedback(keyword, targetUrl, position);
  }
}

export interface DomainAuditItem {
  title: string;
  url: string;
  type: 'page' | 'product' | 'article';
  relevanceScore: number;
}

export interface DomainIntent {
  query: string;
  intent: 'navigational' | 'informational' | 'transactional' | 'commercial';
  context: string;
}

export interface DeepDomainAuditResponse {
  domain: string;
  pages: DomainAuditItem[];
  intents: DomainIntent[];
  visibilityScore: number;
  verdict: string;
}

export async function performDeepDomainAudit(domain: string): Promise<DeepDomainAuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('API Key missing');

  const prompt = `Perform a comprehensive "Deep AI Memory Audit" for the domain: "${domain}".
  
1. Identify up to 10 internal pages or products you recognize from this domain.
2. Identify 3-5 primary "User Search Intents" that lead users to this domain (queries they ask you).
3. Calculate a "Visibility Score" (0-100) based on how often this domain appears in your synthetic search clusters.
4. Provide a "Verdict": A professional SEO/AI-visibility analysis.

Return a single JSON object with EXACTLY this structure:
{
  "domain": string,
  "pages": [ {"title": string, "url": string, "type": "product"|"page", "relevanceScore": number} ],
  "intents": [ {"query": string, "intent": string, "context": string} ],
  "visibilityScore": number,
  "verdict": string
}

IMPORTANT: Do not include trailing commas in arrays or objects. Return ONLY valid JSON.`;

  const textContent = await callGeminiWithRetry(apiKey, prompt);

  let jsonString = textContent.trim();
  const start = jsonString.indexOf('{');
  const end = jsonString.lastIndexOf('}');
  if (start !== -1 && end !== -1) jsonString = jsonString.substring(start, end + 1);

  // Robust cleanup: Remove trailing commas before closing braces/brackets
  jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');

  let data: any = {};
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    console.warn('Primary JSON parse failed, attempting emergency regex recovery:', err);
    // Emergency recovery for common fields if JSON is broken
    const verdictMatch = textContent.match(/"verdict":\s*"([^"]+)"/);
    const scoreMatch = textContent.match(/"visibilityScore":\s*(\d+)/);
    data = {
      verdict: verdictMatch ? verdictMatch[1] : 'Deep audit analysis failed. The AI response was malformed.',
      visibilityScore: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      pages: [],
      intents: []
    };
  }
  
  return {
    domain: String(data.domain || domain),
    pages: Array.isArray(data.pages) ? data.pages.slice(0, 10).map((p: any) => ({
      title: String(p.title || 'Untitled'),
      url: String(p.url || '#'),
      type: p.type === 'product' || p.type === 'article' ? p.type : 'page',
      relevanceScore: Number(p.relevanceScore || 50),
    })) : [],
    intents: Array.isArray(data.intents) ? data.intents.map((i: any) => ({
      query: String(i.query || ''),
      intent: i.intent || 'informational',
      context: String(i.context || ''),
    })) : [],
    visibilityScore: Number(data.visibilityScore || 0),
    verdict: String(data.verdict || 'No verdict available.'),
  };
}

export function estimateTokensUsed(keyword: string): number {
  return Math.ceil(keyword.length / 4) + 1000;
}
