import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryUnit from '@/models/InventoryUnit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { productGroupId, quantity, reason } = await req.json();

    if (!productGroupId || !quantity || quantity <= 0) {
      return NextResponse.json({ message: 'Invalid parameters' }, { status: 400 });
    }

    // FIFO Logic: Earliest Expiry -> Earliest Stocked
    const units = await InventoryUnit.find({
      productGroupId,
      status: 'ACTIVE'
    })
    .sort({ expiryDate: 1, stockedDate: 1 })
    .limit(quantity);

    if (units.length < quantity) {
      return NextResponse.json({ 
        message: `Insufficient stock. Requested ${quantity}, available ${units.length}` 
      }, { status: 400 });
    }

    const unitIds = units.map(u => u._id);
    
    // Bulk update
    await InventoryUnit.updateMany(
      { _id: { $in: unitIds } },
      { 
        $set: { 
          status: 'CONSUMED',
          consumedAt: new Date(),
          consumedReason: reason || 'SALES'
        } 
      }
    );

    return NextResponse.json({ 
      message: 'Stock consumed successfully (FIFO)', 
      consumedCount: units.length,
      units: unitIds 
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
