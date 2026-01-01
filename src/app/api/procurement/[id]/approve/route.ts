import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProcurementRequest from '@/models/ProcurementRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const { approvedQty } = await req.json();

    const request = await ProcurementRequest.findById(id);
    if (!request) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    request.status = 'APPROVED';
    request.approvedQty = approvedQty || request.requestedQty;
    await request.save();

    return NextResponse.json(request);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
