import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SalesInvoice from '@/models/SalesInvoice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const inv = await SalesInvoice.findById(id).lean();
    if (!inv) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const pdf = await PDFDocument.create();
    let page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const title = `Sales Invoice ${inv.invoiceNumber}`;
    page.drawText(title, { x: 50, y: 790, size: 18, font, color: rgb(0, 0, 0) });
    const dateStr = new Date(inv.createdAt || Date.now()).toLocaleString();
    page.drawText(`Date: ${dateStr}`, { x: 50, y: 765, size: 12, font });
    page.drawText(`Customer: ${inv.customerName}`, { x: 50, y: 745, size: 12, font });
    if (inv.customerEmail) {
      page.drawText(`Email: ${inv.customerEmail}`, { x: 50, y: 725, size: 12, font });
    }
    let y = 695;
    page.drawText('Items', { x: 50, y, size: 14, font });
    y -= 20;
    page.drawText('Description', { x: 50, y, size: 12, font });
    page.drawText('Qty', { x: 300, y, size: 12, font });
    page.drawText('Unit Price', { x: 350, y, size: 12, font });
    page.drawText('Line Total', { x: 450, y, size: 12, font });
    y -= 12;
    for (const item of inv.items || []) {
      if (y < 100) {
        page = pdf.addPage([595.28, 841.89]);
        y = 800;
      }
      const desc = String(item.description).slice(0, 40);
      page.drawText(desc, { x: 50, y, size: 11, font });
      page.drawText(String(item.quantity), { x: 300, y, size: 11, font });
      page.drawText(String(item.unitPrice.toFixed(2)), { x: 350, y, size: 11, font });
      page.drawText(String(item.lineTotal.toFixed(2)), { x: 450, y, size: 11, font });
      y -= 16;
    }
    y -= 10;
    page.drawText(`Subtotal: ${inv.subtotal.toFixed(2)}`, { x: 400, y, size: 12, font });
    y -= 16;
    page.drawText(`Tax (${inv.taxRate}%): ${inv.taxAmount.toFixed(2)}`, { x: 400, y, size: 12, font });
    y -= 16;
    page.drawText(`Total: ${inv.totalAmount.toFixed(2)}`, { x: 400, y, size: 14, font });
    if (inv.notes) {
      y -= 30;
      page.drawText('Notes:', { x: 50, y, size: 12, font });
      y -= 16;
      page.drawText(String(inv.notes).slice(0, 200), { x: 50, y, size: 11, font });
    }
    const bytes = await pdf.save();
    const filename = `${inv.invoiceNumber}.pdf`;
    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
