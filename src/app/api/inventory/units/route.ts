import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryUnit from '@/models/InventoryUnit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const units = await InventoryUnit.find().populate('productGroupId', 'productName brandName subCategory').sort({ expiryDate: 1, stockedDate: 1 }).lean();
    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
