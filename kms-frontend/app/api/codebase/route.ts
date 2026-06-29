// app/api/codebase/map/route.ts
// This API route fetches the codebase files from Supabase and transforms them into a structure suitable for React Flow visualization.
// It groups files into modules based on their top-level folder and returns nodes representing both modules and individual files.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || '';

  try {
    // Get all files
    const { data: files } = await supabase
      .from('codebase_files')
      .select('file_path, file_name, language, last_author, metadata')
      .order('file_path');

    // Group into modules (top-level folders)
    const moduleMap = new Map();

    files?.forEach(file => {
      const parts = file.file_path.split('/');
      const moduleName = parts[0] || 'root';

      if (!moduleMap.has(moduleName)) {
        moduleMap.set(moduleName, []);
      }
      moduleMap.get(moduleName).push(file);
    });

    // Transform to React Flow nodes
    const nodes: any[] = [];
    let y = 0;

    moduleMap.forEach((filesInModule, moduleName) => {
      // Module node
      nodes.push({
        id: `module-${moduleName}`,
        type: 'module',
        position: { x: 0, y },
        data: { 
          label: moduleName,
          type: 'module',
          fileCount: filesInModule.length 
        },
        style: { width: 280, background: '#27272a', border: '2px solid #52525b' }
      });

      y += 140;

      // File nodes under module
      filesInModule.forEach((file: any, idx: number) => {
        nodes.push({
          id: file.file_path,
          type: 'file',
          position: { x: 320, y: y - 120 + idx * 60 },
          data: { 
            label: file.file_name,
            fullPath: file.file_path,
            language: file.language,
            author: file.last_author
          },
          parentId: `module-${moduleName}`,
          extent: 'parent',
          style: { width: 240 }
        });
      });
    });

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ nodes: [] }, { status: 500 });
  }
}
