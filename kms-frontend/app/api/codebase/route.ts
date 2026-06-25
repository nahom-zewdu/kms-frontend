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

    const nodes = files?.map((file, i) => {
      const pathParts = file.file_path.split('/');
      const folder = pathParts.length > 1 ? pathParts[0] : 'root';

      return {
        id: file.file_path,
        type: 'default',
        position: { x: (i % 5) * 280, y: Math.floor(i / 5) * 130 },
        data: { 
          label: file.file_name,
          fullPath: file.file_path,
          language: file.language,
          author: file.last_author,
          folder: folder,
          lastModified: file.last_modified_at
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
