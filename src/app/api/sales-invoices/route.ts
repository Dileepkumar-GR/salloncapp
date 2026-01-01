import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SalesInvoice from '@/models/SalesInvoice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const invoices = await SalesInvoice.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.quantity) * Number(it.unitPrice), 0);
    const taxRate = Number(body.taxRate || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const invoiceNumber = `SI-${dd}${mm}${yyyy}-${rand}`;
    const normalizedItems = items.map((it: any) => ({
      description: String(it.description || ''),
      quantity: Number(it.quantity || 0),
      unitPrice: Number(it.unitPrice || 0),
      lineTotal: Number(it.quantity || 0) * Number(it.unitPrice || 0),
    }));
    const doc = await SalesInvoice.create({
      invoiceNumber,
      customerName: String(body.customerName || ''),
      customerEmail: String(body.customerEmail || ''),
      items: normalizedItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      notes: String(body.notes || ''),
      createdBy: session.user.id,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

