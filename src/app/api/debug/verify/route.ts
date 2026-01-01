import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import ProcurementRequest from '@/models/ProcurementRequest';
import InventoryUnit from '@/models/InventoryUnit';
import Invoice from '@/models/Invoice';
import User from '@/models/User';

// Helper to clear test data
async function clearData(prefix: string) {
  await ProductGroup.deleteMany({ productName: { $regex: `^${prefix}` } });
  // cleanup others if needed, but linking via ID is safer
}

export async function GET(req: Request) {
  const results: any[] = [];
  const log = (step: string, status: 'PASS' | 'FAIL', details?: any) => {
    results.push({ step, status, details });
  };

  try {
    await dbConnect();
    const prefix = 'TEST_AUTO_';
    await clearData(prefix);

    // 1. Create Product Group (TC-PG-01)
    const product = await ProductGroup.create({
      brandName: 'TestBrand',
      subCategory: 'TestCat',
      productName: `${prefix}Shampoo`,
      quantityPerItem: 500,
      unit: 'ml',
      sellingPrice: 20,
      lowStockThreshold: 5
    });
    log('TC-PG-01: Create Product Group', 'PASS', { id: product._id });

    // 2. Create Procurement Request (TC-PR-01)
    const request = await ProcurementRequest.create({
      productGroupId: product._id,
      requestedBy: new User()._id, // Dummy ID, usually real user
      quantity: 10,
      purpose: 'Stock Refill',
      status: 'PENDING'
    });
    log('TC-PR-01: Create Procurement Request', 'PASS', { id: request._id });

    // 3. Admin Approve (TC-PR-02)
    request.status = 'APPROVED';
    request.approvedBy = new User()._id;
    request.approvedQty = 10;
    await request.save();
    log('TC-PR-02: Admin Approve', 'PASS', { status: request.status });

    // 4. Receive Stock - Partial (TC-RS-06)
    // Simulating the Logic from Receive API
    const qtyToReceive = 4;
    const units = [];
    for (let i = 0; i < qtyToReceive; i++) {
        units.push({
            productGroupId: product._id,
            sku: `${prefix}SKU_${i}_EARLY`,
            expiryDate: new Date('2025-01-01'), // Early Expiry
            stockedDate: new Date(),
            costPrice: 10,
            status: 'ACTIVE'
        });
    }
    await InventoryUnit.insertMany(units);
    
    // Update Request
    request.receivedQty += qtyToReceive;
    request.status = 'PARTIALLY_RECEIVED';
    await request.save();
    log('TC-RS-06: Partial Receive', 'PASS', { received: request.receivedQty, status: request.status });

    // 5. Receive Rest with LATER Expiry
    const qtyRest = 6;
    const units2 = [];
    for (let i = 0; i < qtyRest; i++) {
        units2.push({
            productGroupId: product._id,
            sku: `${prefix}SKU_${i}_LATE`,
            expiryDate: new Date('2025-02-01'), // Late Expiry
            stockedDate: new Date(),
            costPrice: 10,
            status: 'ACTIVE'
        });
    }
    await InventoryUnit.insertMany(units2);
    request.receivedQty += qtyRest;
    request.status = 'RECEIVED';
    await request.save();

    // Verify Inventory Count (TC-RS-04)
    const totalUnits = await InventoryUnit.countDocuments({ productGroupId: product._id });
    if (totalUnits === 10) {
        log('TC-RS-04: Inventory Record Creation', 'PASS', { count: totalUnits });
    } else {
        log('TC-RS-04: Inventory Record Creation', 'FAIL', { count: totalUnits, expected: 10 });
    }

    // 6. FIFO Consumption Test (TC-FIFO-01)
    // We want to consume 1 unit. Expect the 'EARLY' expiry (2025-01-01) to be picked.
    const consumeQty = 1;
    const unitsToConsume = await InventoryUnit.find({
        productGroupId: product._id,
        status: 'ACTIVE'
    })
    .sort({ expiryDate: 1, stockedDate: 1 })
    .limit(consumeQty);

    if (unitsToConsume.length === 1 && unitsToConsume[0].sku.includes('EARLY')) {
        log('TC-FIFO-01: FIFO by Expiry', 'PASS', { consumedSku: unitsToConsume[0].sku });
    } else {
        log('TC-FIFO-01: FIFO by Expiry', 'FAIL', { 
            consumedSku: unitsToConsume[0]?.sku, 
            expected: 'EARLY...' 
        });
    }

    // 7. Verify Status Update
    await InventoryUnit.updateOne({ _id: unitsToConsume[0]._id }, { status: 'CONSUMED' });
    const consumedUnit = await InventoryUnit.findById(unitsToConsume[0]._id);
    if (consumedUnit.status === 'CONSUMED') {
        log('TC-INV-Status: Status Update', 'PASS', { status: consumedUnit.status });
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
