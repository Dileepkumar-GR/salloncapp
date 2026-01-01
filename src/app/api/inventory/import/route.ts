import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import InventoryUnit from '@/models/InventoryUnit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'No items to import' }, { status: 400 });
    }

    let importedCount = 0;
    const errors = [];

    // Process sequentially to ensure ProductGroup creation consistency
    for (const [index, item] of items.entries()) {
      try {
        // 1. Normalize and Validate
        const brandName = item.Brand || item.brandName;
        const subCategory = item.SubCategory || item.subCategory;
        const productName = item.ProductName || item.productName;
        const quantityPerItem = Number(item.QtyPerItem || item.quantityPerItem);
        const unit = item.Unit || item.unit;
        const sellingPrice = Number(item.SellingPrice || item.sellingPrice);
        
        if (!brandName || !subCategory || !productName || !quantityPerItem || !unit || !sellingPrice) {
          throw new Error(`Row ${index + 1}: Missing required product fields (Brand, SubCategory, ProductName, QtyPerItem, Unit, SellingPrice)`);
        }

        // 2. Find or Create ProductGroup
        // We include sellingPrice in the query because it's part of the unique compound index.
        const productGroup = await ProductGroup.findOneAndUpdate(
          { 
            brandName, 
            subCategory, 
            productName, 
            quantityPerItem, 
            unit,
            sellingPrice 
          },
          {
            $setOnInsert: {
               brandName, 
               subCategory, 
               productName, 
               quantityPerItem, 
               unit, 
               sellingPrice,
               lowStockThreshold: Number(item.LowStockThreshold || item.lowStockThreshold) || 10
            }
          },
          { upsert: true, new: true }
        );

        // 3. Create InventoryUnit
        const costPrice = Number(item.CostPrice || item.costPrice);
        let expiryDateStr = item.ExpiryDate || item.expiryDate;
        
        if (!costPrice) {
           throw new Error(`Row ${index + 1}: Missing CostPrice`);
        }
        if (!expiryDateStr) {
           throw new Error(`Row ${index + 1}: Missing ExpiryDate`);
        }

        // Handle Excel numeric dates if necessary (though usually JSON converter handles string)
        // If it's a number (Excel serial date), convert it. 
        // But for now assume standard string format YYYY-MM-DD
        const expiryDate = new Date(expiryDateStr);
        if (isNaN(expiryDate.getTime())) {
             throw new Error(`Row ${index + 1}: Invalid ExpiryDate format (Use YYYY-MM-DD)`);
        }

        const stockedDate = item.StockedDate ? new Date(item.StockedDate) : new Date();

        // Generate SKU if missing or ensure unique
        let sku = item.SKU || item.sku;
        if (!sku) {
           // Generate a unique SKU: BR-PR-RANDOM
           const prefix = `${brandName.substring(0,2)}${productName.substring(0,2)}`.replace(/\s/g, '').toUpperCase();
           const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
           sku = `${prefix}-${uniqueSuffix}`;
        } else {
            // Check if SKU exists to avoid duplicate key error
            const existingSku = await InventoryUnit.findOne({ sku });
            if (existingSku) {
                 throw new Error(`Row ${index + 1}: SKU ${sku} already exists`);
            }
        }

        await InventoryUnit.create({
          productGroupId: productGroup._id,
          sku,
          expiryDate,
          stockedDate,
          costPrice,
          status: 'ACTIVE'
        });

        importedCount++;

      } catch (err: any) {
        console.error(`Import error row ${index}:`, err);
        errors.push(err.message);
      }
    }

    return NextResponse.json({ 
      message: 'Import process completed', 
      importedCount, 
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
