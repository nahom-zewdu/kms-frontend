// app/api/query/route.ts
// This API route handles POST requests from the PlaybookViewer component when a user asks a question about the playbook. 
// It receives the user's question and the playbook context, then forwards this information to a Go backend service that processes the query and returns an answer. 
// The API route also handles error cases, such as missing questions or backend failures, and returns appropriate responses to the frontend.

import { NextRequest, NextResponse } from 'next/server';

function parseJsonResponse(value: unknown) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
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
  try {
    const { question, context = "" } = await request.json();

    if (!question) {
      return NextResponse.json({ answer: "Please ask a question." }, { status: 400 });
    }

    const response = await fetch('http://localhost:9090/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `${context} ${question}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Backend query failed');
    }

    const data = await response.json();
    let answer = data.answer;
    let sources = data.sources || [];
    let confidence = data.confidence;
    let reasoning = data.reasoning;

    if (typeof answer === 'string') {
      const parsed = parseJsonResponse(answer);
      if (parsed && typeof parsed === 'object') {
        answer = parsed.answer || parsed.response || answer;
        sources = sources.length ? sources : parsed.sources || [];
        confidence = confidence || parsed.confidence;
        reasoning = reasoning || parsed.reasoning;
      }
    }

    if (typeof answer === 'object') {
      reasoning = reasoning || answer.reasoning;
      sources = sources.length ? sources : answer.sources || [];
      confidence = confidence || answer.confidence;
      answer = answer.answer || JSON.stringify(answer, null, 2);
    }

    return NextResponse.json({
      answer: answer || "I don't have enough information yet.",
      sources,
      confidence: confidence || "medium",
      reasoning: reasoning || null,
    });

  } catch (error) {
    console.error("Query API error:", error);
    return NextResponse.json({
      answer: "Sorry, I'm having trouble connecting right now. Try again in a moment."
    }, { status: 500 });
  }
}
