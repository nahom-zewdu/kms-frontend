// app/api/query/route.ts
// Proxies company-scoped questions to the Go /query endpoint.
// Verifies membership, then forwards question + company_id (and optional ramp context).

import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';

type JsonRecord = Record<string, unknown>;
type ConversationMessage = { role: 'user' | 'assistant'; content: string };

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
  if (!user.accessToken) {
    return NextResponse.json({ answer: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedBody: unknown = await request.json();
    const body = isRecord(parsedBody) ? parsedBody : {};
    const question = (body.question || '').toString().trim();
    const companyId = (body.company_id || body.companyId || '').toString().trim();
    const context = (body.context || '').toString().trim();
    const conversationHistory: ConversationMessage[] = Array.isArray(body.conversation_history)
      ? body.conversation_history
          .filter((item: unknown): item is JsonRecord => isRecord(item))
          .filter((item) => item.role === 'user' || item.role === 'assistant')
          .slice(-8)
          .map((item) => ({
            role: item.role as ConversationMessage['role'],
            content: typeof item.content === 'string' ? item.content.slice(0, 4000) : '',
          }))
      : [];

    if (!question) {
      return NextResponse.json({ answer: 'Please ask a question.' }, { status: 400 });
    }
    if (!companyId || !user.companies.some((c) => c.id === companyId)) {
      return NextResponse.json({ answer: 'Forbidden' }, { status: 403 });
    }

    const goUrl = process.env.GO_API_URL || 'http://localhost:9090';
    const response = await fetch(`${goUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        question: question,
        company_id: companyId,
        context: context,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend query failed: ${response.status}`);
    }

    const responseData: unknown = await response.json();
    const data = isRecord(responseData) ? responseData : {};
    let answer: unknown = data.answer;
    let sources: unknown[] = Array.isArray(data.sources) ? data.sources : [];
    let owners: unknown[] = Array.isArray(data.owners) ? data.owners : [];
    let confidence: unknown = data.confidence;
    let abstain_reason: unknown = data.abstain_reason ?? null;

    if (typeof answer === 'string') {
      const parsed = parseJsonResponse(answer);
      if (isRecord(parsed)) {
        answer = parsed.answer || parsed.response || answer;
        sources = sources.length ? sources : Array.isArray(parsed.sources) ? parsed.sources : [];
        owners = owners.length ? owners : Array.isArray(parsed.owners) ? parsed.owners : [];
        confidence = confidence || parsed.confidence;
        abstain_reason = abstain_reason ?? parsed.abstain_reason ?? null;
      }
    }

    if (isRecord(answer)) {
      sources = sources.length ? sources : Array.isArray(answer.sources) ? answer.sources : [];
      owners = owners.length ? owners : Array.isArray(answer.owners) ? answer.owners : [];
      confidence = confidence || answer.confidence;
      abstain_reason = abstain_reason ?? answer.abstain_reason ?? null;
      answer = answer.answer || JSON.stringify(answer);
    }

    return NextResponse.json({
      answer: typeof answer === 'string' && answer ? answer : "I don't have enough information yet.",
      sources,
      owners,
      confidence: typeof confidence === 'string' ? confidence : 'medium',
      abstain_reason: typeof abstain_reason === 'string' ? abstain_reason : null,
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
