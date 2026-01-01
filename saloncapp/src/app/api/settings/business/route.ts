import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { z } from 'zod';

const BusinessSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  businessType: z.enum(['Salon', 'Barbershop', 'Spa']),
  gstNumber: z.string().optional(),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  taxType: z.enum(['Inclusive', 'Exclusive']),
  invoicePrefix: z.string().min(1),
  invoiceFooterMessage: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
});

const WorkingHoursSchema = z.object({
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
  weeklyOffDay: z.string().min(1),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return NextResponse.json({
      business: settings.business,
      workingHours: settings.workingHours,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const businessParse = BusinessSchema.safeParse(body.business);
    const hoursParse = WorkingHoursSchema.safeParse(body.workingHours);
    if (!businessParse.success) {
      return NextResponse.json({ error: businessParse.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    if (!hoursParse.success) {
      return NextResponse.json({ error: hoursParse.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }

    await dbConnect();
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          business: businessParse.data,
          workingHours: hoursParse.data,
        },
      },
      { new: true, upsert: true }
    );
    return NextResponse.json({ business: settings.business, workingHours: settings.workingHours });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
