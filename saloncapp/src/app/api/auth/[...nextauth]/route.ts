import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials or access denied');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Invalid credentials or access denied');
        }

        if (user.isActive === false) {
          throw new Error('Invalid credentials or access denied');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid credentials or access denied');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; role: Role } }) {
      if (user) {
        (token as JWT & { role: Role; id: string }).role = user.role;
        (token as JWT & { role: Role; id: string }).id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT & { role?: Role; id?: string } }) {
      if (session.user) {
        (session.user as Session['user'] & { role?: Role; id?: string }).role = token.role;
        (session.user as Session['user'] & { role?: Role; id?: string }).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
