import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { connectDB } from './mongodb';
import { clientIPFromHeaders, rateLimit } from './rate-limit';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (
          !credentials?.identifier ||
          credentials.identifier.length > 120 ||
          !credentials.password ||
          credentials.password.length > 100
        ) {
          return null;
        }

        const id = credentials.identifier.trim();
        if (!id) return null;
        const ip = clientIPFromHeaders(req.headers ?? {});
        const ipLimit = rateLimit(`login-ip:${ip}`, 10, 15 * 60_000);
        if (!ipLimit.allowed) throw new Error('Too many login attempts');

        const identifierHash = createHash('sha256')
          .update(id.toLowerCase())
          .digest('hex');
        const identifierLimit = rateLimit(
          `login-id:${identifierHash}`,
          5,
          15 * 60_000,
        );
        if (!identifierLimit.allowed) {
          throw new Error('Too many login attempts');
        }

        await connectDB();

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phoneVerified = user.phoneVerified;
      }
      if (token.id) {
        await connectDB();
        const u = await User.findById(token.id)
          .select('role phoneVerified name blocked')
          .lean();
        if (u && !u.blocked) {
          token.role = u.role;
          token.phoneVerified = u.phoneVerified;
          token.name = u.name;
        } else {
          token.id = '';
          token.role = 'tenant';
          token.phoneVerified = false;
          token.name = undefined;
          token.email = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneVerified = token.phoneVerified;
      }
      return session;
    },
  },
};