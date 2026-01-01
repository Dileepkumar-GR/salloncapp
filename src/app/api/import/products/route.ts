import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductGroup from '@/models/ProductGroup';
import InventoryUnit from '@/models/InventoryUnit';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const RowSchema = z.object({
  product_name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(100),
  stock_qty: z.coerce.number().int().min(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(','));
  return rows.map((cols) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = (cols[i] ?? '').trim();
    });
    return obj;
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let rawRows: any[] = [];
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
    } else if (name.endsWith('.csv')) {
      rawRows = parseCSV(buffer.toString('utf-8'));
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const results: { index: number; status: 'inserted' | 'error'; message?: string }[] = [];
    let inserted = 0;

    for (let i = 0; i < rawRows.length; i++) {
      try {
        const parsed = RowSchema.parse(rawRows[i]);

        // Map template to ProductGroup keys with safe defaults
        const brandName = 'Generic';
        const subCategory = parsed.category;
        const productName = parsed.product_name;
        const quantityPerItem = 1;
        const unit = 'piece';
        const sellingPrice = parsed.selling_price;

        const group = await ProductGroup.findOneAndUpdate(
          { brandName, subCategory, productName, quantityPerItem, unit, sellingPrice },
          {
            $setOnInsert: {
              brandName, subCategory, productName, quantityPerItem, unit, sellingPrice,
              lowStockThreshold: 10
            }
          },
          { upsert: true, new: true }
        );

        const count = Math.max(0, parsed.stock_qty);
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const prefix = `${dd}${mm}${yyyy}`;

        const units = [];
        for (let n = 0; n < count; n++) {
          const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
          const sku = `${prefix}-${parsed.sku}-${uniqueId}`;
          units.push({
            productGroupId: group._id,
            sku,
            expiryDate: new Date(), // Unknown from template; require later edits
            stockedDate: new Date(),
            costPrice: parsed.cost_price,
            status: parsed.status === 'ACTIVE' ? 'ACTIVE' : 'ACTIVE'
          });
        }

        if (units.length > 0) {
          await InventoryUnit.insertMany(units);
        }

        inserted += units.length;
        results.push({ index: i + 2, status: 'inserted' });
      } catch (err: any) {
        const msg = err?.issues?.map((x: any) => x.message).join('; ') || err.message || 'Invalid row';
        results.push({ index: i + 2, status: 'error', message: msg });
      }
    }

    return NextResponse.json({
      summary: { inserted, errors: results.filter((r) => r.status === 'error').length },
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
