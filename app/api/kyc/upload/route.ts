import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { uploadAny } from '@/lib/cloudinary';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const form = await req.formData();
    const file = form.get('file') as File;
    if (!file) return fail('No file');
    if (file.size > 10 * 1024 * 1024) return fail('File exceeds 10MB');

    const buf = Buffer.from(await file.arrayBuffer());
    const url = await uploadAny(buf, 'apna-ashta/kyc');

    await connectDB();
    await User.findByIdAndUpdate((session.user as any).id, {
      kycDocument: url,
      kycStatus: 'pending',
    });
    return ok({ url });
  } catch (e) {
    return handleError(e);
  }
}