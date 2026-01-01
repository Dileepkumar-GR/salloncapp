import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import InventoryUnit from '@/models/InventoryUnit';
import ProcurementRequest from '@/models/ProcurementRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 1. Total Products
    const totalProducts = await ProductGroup.countDocuments();

    // 2. Pending Requests
    const pendingRequests = await ProcurementRequest.countDocuments({ status: 'PENDING' });

    // 3. Expired Units (Status is ACTIVE but date passed, or explicitly EXPIRED)
    // We should count units that are ACTIVE but expiryDate < now
    const now = new Date();
    const expiredUnitsCount = await InventoryUnit.countDocuments({
      status: 'ACTIVE',
      expiryDate: { $lt: now }
    });

    // 4. Low Stock Products
    // This is harder because stock is aggregated. We need aggregation.
    const lowStockProducts = await ProductGroup.aggregate([
      {
        $lookup: {
          from: 'inventoryunits',
          localField: '_id',
          foreignField: 'productGroupId',
          pipeline: [{ $match: { status: 'ACTIVE' } }],
          as: 'units'
        }
      },
      {
        $project: {
          productName: 1,
          lowStockThreshold: 1,
          stockCount: { $size: '$units' }
        }
      },
      {
        $match: {
          $expr: { $lte: ['$stockCount', '$lowStockThreshold'] }
        }
      }
    ]);

    // 5. Recent Expiry Alerts (Next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoonUnits = await InventoryUnit.find({
      status: 'ACTIVE',
      expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    })
    .populate('productGroupId', 'productName')
    .sort({ expiryDate: 1 })
    .limit(10);

    return NextResponse.json({
      stats: {
        totalProducts,
        lowStock: lowStockProducts.length,
        expired: expiredUnitsCount,
        pendingRequests
      },
      alerts: {
        lowStock: lowStockProducts.slice(0, 5), // Top 5
        expiringSoon: expiringSoonUnits
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
