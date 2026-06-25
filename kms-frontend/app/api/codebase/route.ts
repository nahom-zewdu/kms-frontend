// app/api/codebase/route.ts
// app/api/codebase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || '';

  try {
    const { data: files, error } = await supabase
      .from('codebase_files')
      .select('file_path, file_name, language, metadata, last_author')
      .order('file_path');

    if (error) throw error;

    // Group by top-level directory for better hierarchy
    const nodes = files?.map((file, index) => {
      const parts = file.file_path.split('/');
      const folder = parts.length > 1 ? parts[0] : 'root';

      return {
        id: file.file_path,
        type: 'default',
        position: { 
          x: (index % 5) * 260, 
          y: Math.floor(index / 5) * 120 
        },
        data: { 
          label: file.file_name,
          fullPath: file.file_path,
          language: file.language,
          author: file.last_author,
          folder: folder
        },
        style: { 
          background: '#18181b', 
          color: '#e4e4e7', 
          border: '1px solid #3f3f46',
          width: 220,
        },
      };
    }) || [];

    return NextResponse.json({ nodes, total: files?.length || 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ nodes: [], error: 'Failed to load codebase' }, { status: 500 });
  }
}
