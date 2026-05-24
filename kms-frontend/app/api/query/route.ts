// app/api/query/route.ts
// This API route handles POST requests from the PlaybookViewer component when a user asks a question about the playbook. 
// It receives the user's question and the playbook context, then forwards this information to a Go backend service that processes the query and returns an answer. 
// The API route also handles error cases, such as missing questions or backend failures, and returns appropriate responses to the frontend.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, context = "" } = await request.json();

    if (!question) {
      return NextResponse.json({ answer: "Please ask a question." }, { status: 400 });
    }

    // Call your existing Go backend query endpoint
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

    return NextResponse.json({
      answer: data.answer || "I don't have enough information yet.",
      sources: data.sources || [],
      confidence: data.confidence || "medium"
    });

  } catch (error) {
    console.error("Query API error:", error);
    return NextResponse.json({
      answer: "Sorry, I'm having trouble connecting right now. Try again in a moment."
    }, { status: 500 });
  }
}
