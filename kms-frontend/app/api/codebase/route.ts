// app/api/codebase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || '';

  try {
    const { data: files } = await supabase
      .from('codebase_files')
      .select('file_path, file_name, language, last_author, last_modified_at, metadata')
      .order('file_path');

    const nodes = files?.map((file) => {
      const parts = file.file_path.split('/');
      const folder = parts.length > 1 ? parts[0] : 'root';

      return {
        id: file.file_path,
        type: 'default',
        position: { x: 0, y: 0 },
        data: { 
          label: file.file_name,
          fullPath: file.file_path,
          folder: folder,
          language: file.language,
          author: file.last_author,
          lastModified: file.last_modified_at?.slice(0,10)
        },
        style: { 
          background: '#18181b', 
          color: '#e4e4e7', 
          border: '1px solid #3f3f46',
          width: 240 
        },
      };
    }) || [];

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ nodes: [], error: 'Failed to load codebase' }, { status: 500 });
  }
}
