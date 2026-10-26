import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        await connectDB();

        const id = credentials.identifier.trim();
        const isEmail = id.includes('@');

        const user = await User.findOne(
          isEmail ? { email: id.toLowerCase() } : { phone: id }
        ).select('+password');

        if (!user) return null;
        if (user.blocked) throw new Error('Account blocked');

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || '',
          role: user.role,
          phoneVerified: user.phoneVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.phoneVerified = (user as any).phoneVerified;
      }
      if (trigger === 'update' && token.id) {
        await connectDB();
        const u = await User.findById(token.id).select('role phoneVerified name').lean();
        if (u) {
          token.role = u.role;
          token.phoneVerified = u.phoneVerified;
          token.name = u.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phoneVerified = token.phoneVerified;
      }
      return session;
    },
  },
};