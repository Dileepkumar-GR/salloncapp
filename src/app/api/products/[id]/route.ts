import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import InventoryUnit from '@/models/InventoryUnit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await ProductGroup.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Get all units for this product
    const units = await InventoryUnit.find({ productGroupId: id }).sort({ expiryDate: 1, stockedDate: 1 });

    return NextResponse.json({ ...product.toObject(), units });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
