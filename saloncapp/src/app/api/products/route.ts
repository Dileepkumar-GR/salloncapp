import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import InventoryUnit from '@/models/InventoryUnit';

export async function GET() {
  try {
    await dbConnect();

    // Aggregate to get total stock for each product group
    // We want all product groups, and for each, count of ACTIVE units
    const products = await ProductGroup.aggregate([
      {
        $lookup: {
          from: 'inventoryunits',
          localField: '_id',
          foreignField: 'productGroupId',
          pipeline: [
            { $match: { status: 'ACTIVE' } }
          ],
          as: 'units'
        }
      },
      {
        $addFields: {
          totalStock: { $size: '$units' },
          earliestExpiry: { $min: '$units.expiryDate' }
        }
      },
      {
        $project: {
          units: 0 // Remove heavy units array from list view
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validation is handled by Mongoose schema (required fields)
    // Unique index on Brand+Sub+Name+Qty+Unit+Price handles uniqueness

    const product = await ProductGroup.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
       return NextResponse.json({ message: 'Product Group already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
