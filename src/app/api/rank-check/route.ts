import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Fuse from 'fuse.js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const authHeader = request.headers.get('authorization');
    let user;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search_id, target_url } = await request.json();
    if (!search_id || !target_url) {
      return NextResponse.json({ error: 'search_id and target_url are required' }, { status: 400 });
    }

    // Fetch search results
    const { data: results } = await supabase
      .from('search_results')
      .select('position, title, url, snippet')
      .eq('search_id', search_id)
      .order('position');

    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'No results found for this search' }, { status: 404 });
    }

    // Normalize URLs for comparison
    const normalizeUrl = (url: string) => {
      try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`);
        return u.hostname.replace('www.', '') + u.pathname.replace(/\/$/, '');
      } catch {
        return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      }
    };

    const normalizedTarget = normalizeUrl(target_url);

    // 1. Exact URL match
    let matchedResult = results.find((r) => normalizeUrl(r.url) === normalizedTarget);

    // 2. Domain match
    if (!matchedResult) {
      const targetDomain = normalizedTarget.split('/')[0];
      matchedResult = results.find((r) => normalizeUrl(r.url).startsWith(targetDomain));
    }

    // 3. Fuzzy match using Fuse.js
    if (!matchedResult) {
      const fuse = new Fuse(results, {
        keys: ['url'],
        threshold: 0.4,
        includeScore: true,
      });
      const fuseResults = fuse.search(target_url);
      if (fuseResults.length > 0 && (fuseResults[0].score || 1) < 0.4) {
        matchedResult = fuseResults[0].item;
      }
    }

    let feedback: string;
    if (matchedResult) {
      feedback = `Your URL was found at position #${matchedResult.position}. The matching result is "${matchedResult.title}". `;
      if (matchedResult.position <= 3) {
        feedback += 'Excellent! Your page ranks in the top 3, indicating strong SEO performance for this keyword.';
      } else if (matchedResult.position <= 10) {
        feedback += 'Good position on page 1. Consider optimizing meta descriptions and building more backlinks to move higher.';
      } else {
        feedback += 'Your page appears on page 2. Focus on content quality, keyword optimization, and link building to improve your ranking.';
      }
    } else {
      feedback = `Your URL was not found in the top ${results.length} results. This could indicate: `;
      feedback += '1) The page is not well-optimized for this keyword. ';
      feedback += '2) There may be a semantic mismatch between your content and the search intent. ';
      feedback += '3) Consider improving on-page SEO: title tags, meta descriptions, header tags, and internal linking. ';
      feedback += '4) Build quality backlinks and ensure your content comprehensively covers the topic.';
    }

    // Save rank check
    await supabase.from('rank_checks').insert({
      search_id,
      target_url,
      is_listed: !!matchedResult,
      position: matchedResult?.position || null,
      feedback,
    });

    return NextResponse.json({
      is_listed: !!matchedResult,
      position: matchedResult?.position || null,
      feedback,
      matched_url: matchedResult?.url || null,
    });
  } catch (error) {
    console.error('Rank check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
