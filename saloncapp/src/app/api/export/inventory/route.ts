import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryUnit from '@/models/InventoryUnit';
import ProductGroup from '@/models/ProductGroup';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

function toCSV(rows: Record<string, any>[]) {
  const headers = [
    'product_name',
    'sku',
    'category',
    'cost_price',
    'selling_price',
    'tax_rate',
    'stock_qty',
    'status',
    'created_at',
  ];
  const data = rows.map((r) =>
    headers
      .map((h) => {
        const v = r[h] ?? '';
        if (typeof v === 'string') {
          const s = v.replace(/"/g, '""');
          return `"${s}"`;
        }
        return String(v);
      })
      .join(',')
  );
  return [headers.join(','), ...data].join('\n');
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();

    const format = new URL(req.url).searchParams.get('format') || 'csv';
    const units = await InventoryUnit.find().lean();
    const productIds = [...new Set(units.map((u: any) => String(u.productGroupId)))];
    const products = await ProductGroup.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p: any) => [String(p._id), p]));

    const rows = units.map((u: any) => {
      const p = productMap.get(String(u.productGroupId));
      return {
        product_name: p?.productName || '',
        sku: u.sku || '',
        category: p?.subCategory || '',
        cost_price: u.costPrice ?? 0,
        selling_price: p?.sellingPrice ?? 0,
        tax_rate: 0,
        stock_qty: 1,
        status: u.status || '',
        created_at: (u.stockedDate ? new Date(u.stockedDate) : new Date(u.createdAt || Date.now())).toISOString(),
      };
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buf, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="inventory_${dateStr}.xlsx"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv = toCSV(rows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory_${dateStr}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
