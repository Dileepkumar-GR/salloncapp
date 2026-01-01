import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProcurementRequest from '@/models/ProcurementRequest';
import ProductGroup from '@/models/ProductGroup';
import Invoice from '@/models/Invoice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

function toCSV(rows: Record<string, any>[]) {
  const headers = [
    'supplier_name',
    'product_name',
    'quantity',
    'purchase_price',
    'invoice_no',
    'purchase_date',
    'status',
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

    const requests = await ProcurementRequest.find().lean();
    const productIds = [...new Set(requests.map((r: any) => String(r.productGroupId)))];
    const products = await ProductGroup.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p: any) => [String(p._id), p]));

    // Try to get first invoice file per request (for invoice_no placeholder)
    const requestIds = requests.map((r: any) => r._id);
    const invoices = await Invoice.find({ procurementId: { $in: requestIds } }).lean();
    const invoiceMap = new Map(invoices.map((inv: any) => [String(inv.procurementId), inv]));

    const rows = requests.map((r: any) => {
      const p = productMap.get(String(r.productGroupId));
      const inv = invoiceMap.get(String(r._id));
      return {
        supplier_name: '', // Supplier model not present; leave blank
        product_name: p?.productName || '',
        quantity: r.approvedQty || r.requestedQty || 0,
        purchase_price: r.estimatedPrice ?? 0,
        invoice_no: inv?.files?.[0] || '',
        purchase_date: (r.updatedAt || r.createdAt || new Date()).toISOString(),
        status: r.status || '',
      };
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Procurement');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buf, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="procurement_${dateStr}.xlsx"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv = toCSV(rows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="procurement_${dateStr}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
