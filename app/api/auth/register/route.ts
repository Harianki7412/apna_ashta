import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Verification } from '@/models/Verification';
import { registerSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit, clientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`reg:${clientIP(req)}`, 5, 60_000);
    if (!rl.allowed) return fail('Too many requests', 429);

    const data = registerSchema.parse(await req.json());
    await connectDB();

    // The chosen method's identifier must be verified
    const verifiedIdentifier =
      data.verifiedBy === 'email' ? data.email!.toLowerCase() : data.phone!;

    const verification = await Verification.findOne({
      identifier: verifiedIdentifier,
      method: data.verifiedBy,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return fail(
        `Please verify your ${data.verifiedBy} first before creating account`,
        403
      );
    }

    // Uniqueness checks
    if (data.email) {
      const exists = await User.findOne({ email: data.email.toLowerCase() });
      if (exists) return fail('Email already in use', 409);
    }
    if (data.phone) {
      const exists = await User.findOne({ phone: data.phone });
      if (exists) return fail('Phone already in use', 409);
    }

    // Create user
    const hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email?.toLowerCase(),
      phone: data.phone,
      password: hash,
      role: data.role,
      emailVerified: data.verifiedBy === 'email',
      phoneVerified: data.verifiedBy === 'phone',
    });

    // Cleanup verification record
    await Verification.deleteOne({
      identifier: verifiedIdentifier,
      method: data.verifiedBy,
    });

    return ok({ id: user._id, email: user.email, phone: user.phone }, 201);
  } catch (e) {
    return handleError(e);
  }
}