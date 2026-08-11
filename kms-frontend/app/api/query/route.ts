// app/api/query/route.ts
// Proxies company-scoped questions to the Go /query endpoint.
// Verifies membership, then forwards question + company_id (and optional ramp context).

import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';

function parseJsonResponse(value: unknown) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  const match = trimmed.match(/({[\s\S]*})/);
  if (match?.[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const user = await getUserContext();
  if (!user) {
    return NextResponse.json({ answer: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const question = (body.question || '').toString().trim();
    const companyId = (body.company_id || body.companyId || '').toString().trim();
    const context = (body.context || '').toString().trim();

    if (!question) {
      return NextResponse.json({ answer: 'Please ask a question.' }, { status: 400 });
    }
    if (!companyId || !user.companies.some((c) => c.id === companyId)) {
      return NextResponse.json({ answer: 'Forbidden' }, { status: 403 });
    }

    const goUrl = process.env.GO_API_URL || 'http://localhost:9090';
    const response = await fetch(`${goUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: context ? `${context}\n\nQuestion: ${question}` : question,
        company_id: companyId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend query failed: ${response.status}`);
    }

    const data = await response.json();
    let answer = data.answer;
    let sources = data.sources || [];
    let owners = data.owners || [];
    let confidence = data.confidence;
    let abstain_reason = data.abstain_reason ?? null;

    if (typeof answer === 'string') {
      const parsed = parseJsonResponse(answer);
      if (parsed && typeof parsed === 'object') {
        answer = parsed.answer || parsed.response || answer;
        sources = sources.length ? sources : parsed.sources || [];
        owners = owners.length ? owners : parsed.owners || [];
        confidence = confidence || parsed.confidence;
        abstain_reason = abstain_reason ?? parsed.abstain_reason ?? null;
      }
    }

    if (typeof answer === 'object' && answer !== null) {
      sources = sources.length ? sources : (answer as any).sources || [];
      owners = owners.length ? owners : (answer as any).owners || [];
      confidence = confidence || (answer as any).confidence;
      abstain_reason = abstain_reason ?? (answer as any).abstain_reason ?? null;
      answer = (answer as any).answer || JSON.stringify(answer);
    }

    return NextResponse.json({
      answer: answer || "I don't have enough information yet.",
      sources,
      owners,
      confidence: confidence || 'medium',
      abstain_reason,
    });
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      {
        answer:
          "Sorry, I'm having trouble connecting right now. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
