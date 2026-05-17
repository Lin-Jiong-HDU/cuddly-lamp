import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ arxivId: string }> },
) {
  const { arxivId } = await params;

  // Only allow valid arxiv IDs (digits and dots) to prevent path traversal
  if (!/^[\d.]+$/.test(arxivId)) {
    return new NextResponse('Invalid arxiv ID', { status: 400 });
  }

  const filePath = join(
    process.cwd(),
    'vendor',
    'paper-repository',
    'papers',
    arxivId,
    'detail.html',
  );

  try {
    const fileContents = await readFile(filePath, 'utf-8');
    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
