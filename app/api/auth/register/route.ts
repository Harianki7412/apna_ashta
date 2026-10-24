import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit, clientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`register:${clientIP(req)}`, 5, 60_000);
    if (!rl.allowed) return fail('Too many requests', 429);

    const body = await req.json();
    const data = registerSchema.parse(body);

    await connectDB();
    const exists = await User.findOne({ email: data.email });
    if (exists) return fail('Email already in use', 409);

    const hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({ ...data, password: hash });
    return ok({ id: user._id, email: user.email }, 201);
  } catch (e) {
    return handleError(e);
  }
}