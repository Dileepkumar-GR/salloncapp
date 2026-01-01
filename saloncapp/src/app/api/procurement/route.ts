import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProcurementRequest from '@/models/ProcurementRequest';
import ProductGroup from '@/models/ProductGroup'; // Ensure model is registered
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const requests = await ProcurementRequest.find()
      .populate('productGroupId')
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const body = await req.json();
    const {
      productGroupId,
      purpose,
      requestedQty,
      estimatedPrice,
      expectedDeliveryDate,
      remarks,
    } = body || {};

    if (!productGroupId) {
      return NextResponse.json({ message: 'Product group is required' }, { status: 400 });
    }
    if (!purpose || !['RETAIL', 'INHOUSE'].includes(String(purpose))) {
      return NextResponse.json({ message: 'Purpose must be Retail or In-House' }, { status: 400 });
    }
    const qty = Number(requestedQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ message: 'Quantity must be a positive number' }, { status: 400 });
    }
    const estPrice = estimatedPrice !== undefined ? Number(estimatedPrice) : undefined;
    if (estPrice !== undefined && (!Number.isFinite(estPrice) || estPrice < 0)) {
      return NextResponse.json({ message: 'Estimated price must be a non-negative number' }, { status: 400 });
    }
    const expDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined;
    if (expectedDeliveryDate && isNaN(expDate!.getTime())) {
      return NextResponse.json({ message: 'Expected delivery date is invalid' }, { status: 400 });
    }

    const request = await ProcurementRequest.create({
      productGroupId,
      purpose,
      requestedQty: qty,
      estimatedPrice: estPrice,
      expectedDeliveryDate: expDate,
      remarks,
      status: 'PENDING',
      createdBy: session.user.id,
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
