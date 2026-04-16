import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performDeepDomainAudit } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return NextResponse.json({ error: 'Valid domain or URL is required' }, { status: 400 });
    }

    // Sanitize domain
    let sanitizedDomain = domain.trim().toLowerCase();
    try {
      if (sanitizedDomain.startsWith('http')) {
        sanitizedDomain = new URL(sanitizedDomain).hostname;
      }
    } catch { }

    const auditData = await performDeepDomainAudit(sanitizedDomain);

    return NextResponse.json(auditData);
  } catch (error: any) {
    console.error('Domain audit error:', error);
    const message = error.message || 'Failed to perform domain audit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
