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

    // Group into logical modules for MVP
    const moduleMap = new Map<string, any[]>();

    files?.forEach(file => {
      const parts = file.file_path.split('/');
      const moduleName = parts[0] || 'root'; // Top-level folder as module
      
      if (!moduleMap.has(moduleName)) moduleMap.set(moduleName, []);
      moduleMap.get(moduleName)!.push(file);
    });

    const nodes: any[] = [];
    const edges: any[] = [];

    let moduleX = 0;
    moduleMap.forEach((filesInModule, moduleName) => {
      // Module Node
      const moduleNode = {
        id: `module-${moduleName}`,
        type: 'default',
        position: { x: moduleX, y: 100 },
        data: { 
          label: moduleName.toUpperCase(), 
          isModule: true,
          fileCount: filesInModule.length 
        },
        style: { 
          background: '#27272a', 
          color: '#e4e4e7', 
          border: '3px solid #52525b',
          width: 320,
          padding: '16px',
          fontSize: '18px',
          fontWeight: '700'
        },
      };
      nodes.push(moduleNode);

      // File Nodes inside module
      filesInModule.forEach((file, idx) => {
        const fileNode = {
          id: file.file_path,
          type: 'default',
          position: { x: moduleX + 40, y: 180 + idx * 70 },
          parentId: `module-${moduleName}`,
          extent: 'parent',
          data: { 
            label: file.file_name,
            fullPath: file.file_path,
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
        nodes.push(fileNode);
      });

      moduleX += 380;
    });

    return NextResponse.json({ nodes, edges });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ nodes: [], edges: [] }, { status: 500 });
  }
}
