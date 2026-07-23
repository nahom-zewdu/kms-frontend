// app/api/users/route.ts

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUserContext();
  if (!user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .eq('company_id', user.company_id);

  return NextResponse.json({ users: data });
}
