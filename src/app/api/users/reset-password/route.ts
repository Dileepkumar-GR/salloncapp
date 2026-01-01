import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, password } = await req.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } }, { new: true });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
