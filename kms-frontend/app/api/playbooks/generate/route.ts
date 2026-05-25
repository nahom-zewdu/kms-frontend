// app/api/playbooks/generate/route.ts
// This API route handles the generation of new playbooks based on the role and employee name provided by the user.
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { role, employeeName } = await request.json();

  // Call your Go backend if needed, or directly call Python
  const res = await fetch('http://localhost:8000/playbooks/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, employee_name: employeeName }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
