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
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params; // Unit ID
    const { reason } = await req.json(); // e.g., 'SALES', 'DAMAGED', 'INTERNAL'

    const unit = await InventoryUnit.findById(id);
    if (!unit) {
      return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    }

    if (unit.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Unit is not active' }, { status: 400 });
    }

    unit.status = 'CONSUMED';
    unit.consumedAt = new Date();
    unit.consumedReason = reason || 'MANUAL';
    await unit.save();

    return NextResponse.json({ message: 'Unit consumed successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
