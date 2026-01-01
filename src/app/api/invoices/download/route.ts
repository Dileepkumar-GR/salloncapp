import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const fileParam = url.searchParams.get('file');
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';
    if (!fileParam) {
      return NextResponse.json({ message: 'Missing file parameter' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), '.uploads', 'invoices');
    const requested = path.resolve(process.cwd(), fileParam);
    const allowed = path.resolve(baseDir);

    if (!requested.startsWith(allowed)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const exists = await fs.promises.stat(requested).then(() => true).catch(() => false);
    if (!exists) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(requested).toLowerCase();
    const name = path.basename(requested);
    const contentType =
      ext === '.pdf' ? 'application/pdf' :
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      'application/octet-stream';

    const buf = await fs.promises.readFile(requested);
    return new Response(buf, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `${disposition}; filename="${name}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
