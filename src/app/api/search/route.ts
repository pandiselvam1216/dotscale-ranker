import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchSearchResults, estimateTokensUsed } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Explicitly parse Bearer token from header because Next.js chunked cookies can drift on fast signouts
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

    // Check if user is blocked (gracefully handle missing table)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', user.id)
        .single();

      if (profile?.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked' }, { status: 403 });
      }
    } catch {
      // profiles table may not exist yet — skip check
    }

    // Rate limiting
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s` },
        { status: 429 }
      );
    }

    const { keyword } = await request.json();
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const sanitizedKeyword = keyword.trim().slice(0, 200);

    // Check cache (search within last 24 hours) — gracefully handle missing table
    try {
      const { data: cachedSearch } = await supabase
        .from('searches')
        .select('id')
        .eq('keyword', sanitizedKeyword)
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedSearch) {
        const { data: cachedResults } = await supabase
          .from('search_results')
          .select('position, title, url, snippet')
          .eq('search_id', cachedSearch.id)
          .order('position');

        if (cachedResults && cachedResults.length > 0) {
          return NextResponse.json({
            results: cachedResults,
            search_id: cachedSearch.id,
            cached: true,
          });
        }
      }
    } catch {
      // Tables may not exist yet — proceed to Gemini
    }

    // Fetch from Gemini
    let aiResponse;
    try {
      aiResponse = await fetchSearchResults(sanitizedKeyword);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      const message = geminiError instanceof Error ? geminiError.message : 'Gemini API failed';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const { results, aiOverview } = aiResponse;

    // Save search to DB (gracefully handle missing table)
    let searchId: string | null = null;
    try {
      // First attempt with ai_overview
      let { data: search, error: searchError } = await supabase
        .from('searches')
        .insert({ 
          user_id: user.id, 
          keyword: sanitizedKeyword,
          ai_overview: aiOverview 
        })
        .select('id')
        .single();
        
      if (searchError && searchError.message.includes('ai_overview')) {
        console.warn('ai_overview column missing, retrying without it...');
        const retry = await supabase
          .from('searches')
          .insert({ 
            user_id: user.id, 
            keyword: sanitizedKeyword 
          })
          .select('id')
          .single();
        search = retry.data;
        searchError = retry.error;
      }

      if (searchError) {
        console.error('Failed to insert search:', searchError);
      }

      searchId = search?.id || null;

      if (searchId) {
        // Save results
        const resultRows = results.map((r) => ({
          search_id: searchId,
          position: r.position,
          title: r.title,
          url: r.url,
          snippet: r.snippet,
        }));

        const { error: resultsError } = await supabase.from('search_results').insert(resultRows);
        if (resultsError) {
          console.error('Failed to insert search_results:', resultsError);
        }
      }

      // Log API usage
      const { error: apiLogError } = await supabase.from('api_logs').insert({
        user_id: user.id,
        endpoint: 'gemini/search',
        tokens_used: estimateTokensUsed(sanitizedKeyword),
      });
      if (apiLogError) {
        console.error('Failed to insert api_logs:', apiLogError);
      }
    } catch (err) {
      // DB save failed but we still have results — continue
      console.warn('Failed to save search to database:', err);
    }

    return NextResponse.json({
      results,
      aiOverview,
      search_id: searchId,
      cached: false,
    });
  } catch (error) {
    console.error('Search API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
