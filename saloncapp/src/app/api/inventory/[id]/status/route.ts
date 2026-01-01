import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryUnit from '@/models/InventoryUnit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();
    if (!['ACTIVE', 'EXPIRED', 'CONSUMED'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    await InventoryUnit.updateOne({ _id: id }, { $set: { status } });
    return NextResponse.json({ message: 'Status updated' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
