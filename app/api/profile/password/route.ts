import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { rateLimit } from '@/lib/rate-limit';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { passwordChangeSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const me = session.user.id;
    const rl = rateLimit(`pwd:${me}`, 3, 300_000);
    if (!rl.allowed) return fail('Too many attempts', 429);

    const { currentPassword, newPassword } = passwordChangeSchema.parse(
      await req.json(),
    );

    await connectDB();
    const user = await User.findById(me).select('+password');
    if (!user) return fail('Not found', 404);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return fail('Incorrect password');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}