import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

const CSV_HEADERS = [
  'product_name',
  'sku',
  'category',
  'cost_price',
  'selling_price',
  'tax_rate',
  'stock_qty',
  'status',
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

    if (format === 'xlsx') {
      const worksheetData = [CSV_HEADERS];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new Response(buffer, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="products_template.xlsx"',
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv =
      CSV_HEADERS.join(',') +
      '\n' +
      [
        // optional sample row (empty numeric to be filled)
        [
          'Sample Product',
          'SKU-001',
          'Hair Care',
          '',
          '',
          '0',
          '0',
          'ACTIVE',
        ].join(','),
      ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products_template.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}
