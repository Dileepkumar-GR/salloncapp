import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProcurementRequest from '@/models/ProcurementRequest';
import InventoryUnit from '@/models/InventoryUnit';
import Invoice from '@/models/Invoice';
import ProcurementReceive from '@/models/ProcurementReceive';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const form = await req.formData();
    const receivingNow = String(form.get('receivingNow') || '');
    const skuSuffix = String(form.get('skuSuffix') || '');
    const expiryDate = String(form.get('expiryDate') || '');
    const stockedDate = String(form.get('stockedDate') || '');
    const costPrice = String(form.get('costPrice') || '');
    const files = form.getAll('invoices').filter((f) => f instanceof File) as File[];

    const request = await ProcurementRequest.findById(id);
    if (!request) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'APPROVED' && request.status !== 'PARTIALLY_RECEIVED') {
      return NextResponse.json({ message: 'Request must be APPROVED to receive stock' }, { status: 400 });
    }

    const qtyToReceive = parseInt(receivingNow);
    if (isNaN(qtyToReceive) || qtyToReceive <= 0) {
      return NextResponse.json({ message: 'Invalid quantity' }, { status: 400 });
    }

    // Check if we are over-receiving
    if (request.receivedQty + qtyToReceive > request.approvedQty) {
       return NextResponse.json({ message: 'Cannot receive more than approved quantity' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'Invoice upload is mandatory' }, { status: 400 });
    }
    const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg']);
    for (const f of files) {
      if (!allowedTypes.has(f.type)) {
        return NextResponse.json({ message: 'Invalid file type. Allowed: PDF, PNG, JPG' }, { status: 400 });
      }
      if (f.size > 10 * 1024 * 1024) {
        return NextResponse.json({ message: 'File too large. Max 10MB per file' }, { status: 400 });
      }
    }

    // Securely store files on disk (private directory)
    const baseDir = path.join(process.cwd(), '.uploads', 'invoices');
    await fs.promises.mkdir(baseDir, { recursive: true });
    const storedFiles: { fileName: string; fileType: string; fileSize: number; path: string }[] = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const outName = `${id}-${timestamp}-${safeName}`;
      const outPath = path.join(baseDir, outName);
      await fs.promises.writeFile(outPath, buf);
      storedFiles.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        path: path.relative(process.cwd(), outPath),
      });
    }

    const receiveLog = await ProcurementReceive.create({
      procurementId: id,
      receivedQty: qtyToReceive,
      skuSuffix,
      expiryDate: new Date(expiryDate),
      stockedDate: stockedDate ? new Date(stockedDate) : new Date(),
      costPrice: parseFloat(costPrice),
      createdBy: session.user.id,
    });
    await Invoice.create({
      procurementId: id,
      receiveId: receiveLog._id,
      files: storedFiles,
      uploadedAt: new Date(),
      uploadedBy: session.user.id,
    });

    // Generate Inventory Units
    const units = [];
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    // Note: User asked for DDMMYYYY
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDatePrefix = `${dd}${mm}${yyyy}`;

    for (let i = 0; i < qtyToReceive; i++) {
      // Generate unique SKU
      // SKU Format: DDMMYYYY-SUFFIX-TIMESTAMP-INDEX to ensure uniqueness
      // User said "Auto prefix: DDMMYYYY. Manager enters suffix"
      // But we need uniqueness. I will append a random string or counter.
      const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
      const sku = `${formattedDatePrefix}-${skuSuffix}-${uniqueId}`;

      units.push({
        productGroupId: request.productGroupId,
        sku,
        expiryDate: new Date(expiryDate),
        stockedDate: stockedDate ? new Date(stockedDate) : new Date(),
        costPrice: parseFloat(costPrice),
        status: 'ACTIVE',
      });
    }

    await InventoryUnit.insertMany(units);

    // Update Request
    request.receivedQty += qtyToReceive;
    
    if (request.receivedQty >= request.approvedQty) {
      request.status = 'RECEIVED';
    } else {
      request.status = 'PARTIALLY_RECEIVED';
    }
    
    await request.save();

    return NextResponse.json({ message: 'Stock received successfully', receivedCount: qtyToReceive });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
