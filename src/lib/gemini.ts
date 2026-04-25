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

async function callGeminiWithRetry(apiKey: string, prompt: string, retries = 3, tools?: any[]): Promise<string> {
  const systemInstruction = `### SYSTEM ROLE: SEARCH-GROUNDED BRAND AUDITOR
You are a specialized AI Auditor for the NeuraGlobal ecosystem. Your goal is to replicate the "Gemini Search Grounding" logic: prioritizing factual, live-web evidence over internal training data.

### OPERATIONAL PIPELINE:
1. DIVERGENCE (Research Phase):
   - When a user asks about a domain or keyword, your first step is to generate 3-5 specific search queries.
   - You MUST cross-reference the top 15 results from the live web (Google Search Index).
   - Identify the "Identity Consensus"—how the world currently defines this brand.

2. GOVERNANCE (Audit Phase):
   - Compare the live results to your internal "Memory." 
   - If there is a conflict (e.g., LivBio is "Clothing" in search but "Biotech" in memory), you MUST flag this as an "Identity Gap" in your summary.
   - Do not hallucinate. If you cannot find a specific product on the live domain, do not list it.

3. CONVERGENCE (Synthesis Phase):
   - Provide a final JSON output.
   - Include "results": An array of 15 items from the Search Index.
   - Include "aiOverview": A summary with "attributions" (linking claims to result indices 1-15).
   - Assign a "visibilityScore": Based on the brand's dominance in search snippets.

### STYLISTIC GUIDELINES:
- Tone: Professional, clinical, and data-driven (like a Google Search Console report).
- Bias: Strictly local. Prioritize Indian regional context (Bharat) for .in domains.
- Persistence: Stay in "JSON Mode" even if the user asks a follow-up question.

Return ONLY valid JSON. Keep keys consistent.`;
  
  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const body: any = {
        contents: [{ parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      };

      if (tools && tools.length > 0) {
        body.tools = tools;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const prompt = `Perform a SEARCH-GROUNDED BRAND AUDIT for: "${keyword}".
  
  ### Audit Parameters:
  - Generate 3-5 search queries to triangulate the most authoritative results.
  - Return exactly 15 results from the Google Search Index.
  - In the "summary", identify the "Identity Consensus" and highlight any "Identity Gaps" between current search results and general AI memory.
  - Ensure the "results" array in your JSON contains exactly 15 items.`;

  const tools = [{ google_search: {} }];
  const textContent = await callGeminiWithRetry(apiKey, prompt, 3, tools);

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
        summary: String(data.aiOverview?.summary || data.summary || 'No summary available.'),
        attributions: Array.isArray(data.aiOverview?.attributions || data.attributions) 
          ? (data.aiOverview?.attributions || data.attributions).map((a: any) => ({
              sentence: String(a.sentence || ''),
              sourcePosition: Math.max(1, Math.min(15, Number(a.sourcePosition || a.position || 1))),
              contributionScore: Math.max(1, Number(a.contributionScore || a.score || 10)),
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
  visibilityScore: number;
  verdict: string;
  recoveryUsed?: boolean;
}

export async function performDeepDomainAudit(domain: string): Promise<DeepDomainAuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('API Key missing');

  const prompt = `Perform a SEARCH-GROUNDED "Deep AI Memory Audit" for: "${domain}".
  
  1. Audit the live web to identify 6 key pages, products, or assets associated with this domain.
  2. Compare live visibility with internal AI memory to detect representation gaps.
  3. Provide a "verdict" based on the "Identity Consensus" found via search.

Return a JSON object with:
{
  "visibilityScore": number,
  "pages": [ {"title": string, "url": string, "type": "product"|"page", "relevanceScore": number} ],
  "verdict": string
}
IMPORTANT: Base score and verdict on regional context (India/Bharat) for .in domains.`;

  const tools = [{ google_search: {} }]; 
  const textContent = await callGeminiWithRetry(apiKey, prompt, 3, tools);

  let jsonString = textContent.trim();
  const start = jsonString.indexOf('{');
  const end = jsonString.lastIndexOf('}');
  if (start !== -1 && end !== -1) jsonString = jsonString.substring(start, end + 1);

  // Robust cleanup: Remove trailing commas before closing braces/brackets
  jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');

  // Extract high-level fields via regex as strong fallbacks
  // 1. Ultimate Mega-Regex (Multi-pass raw text scanning)
  const verdictRegex = /"(?:verdict|analysis|summary|assessment)":\s*"([^"]+)"/i;
  const scoreRegex = /"(?:visibilityScore|score|impact|visibility|magnitude)":\s*(\d+)/i;
  let verdictMatch = textContent.match(verdictRegex);
  let scoreMatch = textContent.match(scoreRegex);

  // Second pass: Raw text patterns (if JSON keys failed)
  if (!verdictMatch) verdictMatch = textContent.match(/(?:Verdict|Analysis|Summary|Assessment)\D*:\s*([^}\n"]+)/i);
  if (!scoreMatch) scoreMatch = textContent.match(/(?:Visibility|Score|Impact|Magnitude)\D*(\d{1,3})/i);

  const pageObjects: any[] = [];
  const allObjects = textContent.match(/\{[^{}]*\}/g) || [];
  
  allObjects.forEach(m => {
      try {
          const obj = JSON.parse(m.replace(/,\s*[\]}]/g, res => res.slice(1)));
          const keys = Object.keys(obj).map(k => k.toLowerCase());
          
          // Fuzzy Classifier (Semantic Matching for Assets only)
          const isPage = keys.some(k => k.includes('title') || k.includes('url') || k.includes('link') || k.includes('page') || k.includes('asset') || k.includes('t'));

          if (isPage) {
            pageObjects.push({
              title: obj.title || obj.t || obj.name || 'AI Asset',
              url: obj.url || obj.u || obj.link || '#',
              relevanceScore: obj.relevanceScore || obj.r || obj.impact || 85
            });
          }
      } catch {}
  });

  let data: any = { pages: pageObjects, isRecovery: true };
  try {
    // 2. Advanced JSON "Repair" (Brace Balancer)
    let repaired = jsonString;
    const stack: string[] = [];
    let inString = false;
    for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '"' && repaired[i - 1] !== '\\') inString = !inString;
        if (!inString) {
            if (repaired[i] === '{' || repaired[i] === '[') stack.push(repaired[i] === '{' ? '}' : ']');
            else if (repaired[i] === '}' || repaired[i] === ']') stack.pop();
        }
    }
    while (stack.length > 0) repaired += stack.pop();
    const parsed = JSON.parse(repaired.replace(/,\s*[\]}]/g, m => m.slice(1)));
    
    // 3. Hybrid Merge (Combine JSON results with Greedy results)
    data = {
      ...parsed,
      pages: [...(parsed.pages || []), ...pageObjects].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i),
      isRecovery: parsed.isRecovery || allObjects.length > 0
    };
  } catch (err) {
    console.warn('Hybrid parsing fallback used:', err);
    data.verdict = verdictMatch ? verdictMatch[1] : 'Partial audit data recovered via hybrid pattern matching.';
    data.visibilityScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;
  }
  
  // 5. Final Data Normalization Layer
  return {
    domain: domain,
    pages: (Array.isArray(data.pages) ? data.pages : []).slice(0, 7).map((p: any) => {
      let score = Number(p.relevanceScore || 50);
      if (score > 0 && score <= 1) score = Math.round(score * 100);
      return {
        title: String(p.title || 'Untitled'),
        url: String(p.url || '#'),
        type: p.type === 'product' || p.type === 'article' ? p.type : 'page',
        relevanceScore: Math.min(100, Math.max(0, score)),
      };
    }),
    visibilityScore: Number((data.visibilityScore || (scoreMatch ? parseInt(scoreMatch[1]) : 0)) > 1 ? (data.visibilityScore || (scoreMatch ? parseInt(scoreMatch[1]) : 0)) : (data.visibilityScore || (scoreMatch ? parseInt(scoreMatch[1]) : 0)) * 100 || 30),
    verdict: String(data.verdict || verdictMatch?.[1]?.trim() || 'No verdict available.'),
    recoveryUsed: !!data.isRecovery
  };
}

export function estimateTokensUsed(keyword: string): number {
  return Math.ceil(keyword.length / 4) + 1000;
}
