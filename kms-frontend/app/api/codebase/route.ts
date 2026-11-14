// app/api/codebase/route.ts
// Returns the active company's indexed file inventory for the codebase map.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getUserContext();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = user.activeCompany?.id;
    if (!companyId) {
      return NextResponse.json({ error: 'No active company found' }, { status: 403 });
    }

    const supabase = await createServerSupabase();
    const { data: repositories, error: repositoriesError } = await supabase
      .from('repositories')
      .select('id')
      .eq('company_id', companyId);

    if (repositoriesError) {
      console.error('[api/codebase:repositories]', repositoriesError.message);
      return NextResponse.json({ error: 'Could not load company repositories.' }, { status: 500 });
    }

    const repositoryIds = (repositories ?? []).map((repository) => repository.id);
    if (repositoryIds.length === 0) {
      return NextResponse.json({ nodes: [] });
    }

    const { data: files, error: filesError } = await supabase
      .from('codebase_files')
      .select('file_path, file_name, language, last_author, metadata')
      .in('repository_id', repositoryIds)
      .order('file_path');

    if (filesError) {
      console.error('[api/codebase:files]', filesError.message);
      return NextResponse.json({ error: 'Could not load indexed company files.' }, { status: 500 });
    }

    type CodebaseFile = {
      file_path: string;
      file_name: string | null;
      language: string | null;
      last_author: string | null;
    };

    const moduleMap = new Map<string, CodebaseFile[]>();
    (files ?? []).forEach((file) => {
      const moduleName = file.file_path.split('/')[0] || 'root';
      const moduleFiles = moduleMap.get(moduleName) ?? [];
      moduleFiles.push(file);
      moduleMap.set(moduleName, moduleFiles);
    });

    const nodes: Record<string, unknown>[] = [];
    let y = 0;

    moduleMap.forEach((filesInModule, moduleName) => {
      nodes.push({
        id: `module-${moduleName}`,
        type: 'module',
        position: { x: 0, y },
        data: { label: moduleName, type: 'module', fileCount: filesInModule.length },
        style: { width: 280, background: '#27272a', border: '2px solid #52525b' },
      });

      y += 140;
      filesInModule.forEach((file, index) => {
        nodes.push({
          id: file.file_path,
          type: 'file',
          position: { x: 320, y: y - 120 + index * 60 },
          data: {
            label: file.file_name,
            fullPath: file.file_path,
            language: file.language,
            author: file.last_author,
          },
          parentId: `module-${moduleName}`,
          extent: 'parent',
          style: { width: 240 },
        });
      });
    });

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('[api/codebase]', error);
    return NextResponse.json({ error: 'Could not load the company codebase.' }, { status: 500 });
  }
}
