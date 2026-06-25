// app/api/codebase/route.ts
// This API route fetches the codebase files from Supabase and returns them as React Flow nodes for visualization in the PlaybookViewer component.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role');

  try {
    // Fetch files from the physical codebase layer
    const { data: files, error } = await supabase
      .from('codebase_files')
      .select('file_path, file_name, language, metadata')
      .order('file_path')
      .limit(80);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load codebase' }, { status: 500 });
    }

    // Transform into React Flow nodes
    const nodes = files?.map((file, index) => ({
      id: file.file_path,
      type: 'default',
      position: { 
        x: (index % 6) * 240, 
        y: Math.floor(index / 6) * 110 
      },
      data: { 
        label: file.file_name,
        fullPath: file.file_path,
        language: file.language
      },
      style: { 
        background: '#18181b', 
        color: '#e4e4e7', 
        border: '1px solid #3f3f46',
        width: 180 
      },
    })) || [];

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
