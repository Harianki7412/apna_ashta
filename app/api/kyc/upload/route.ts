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

    await connectDB();
    const user = await User.findById(session.user.id).select('phoneVerified');
    if (!user) return fail('User not found', 404);
    if (!user.phoneVerified) return fail('Verify your mobile number first', 403);

    const form = await req.formData();
    const front = form.get('front');
    const back = form.get('back');
    if (!(front instanceof File) || !(back instanceof File))
      return fail('Upload both the front and back photos of your Aadhaar card');

    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ]);
    for (const file of [front, back]) {
      if (!allowedTypes.has(file.type))
        return fail('Aadhaar photos must be JPG, PNG, WebP, or HEIC images');
      if (file.size > 10 * 1024 * 1024)
        return fail('Each photo must be smaller than 10MB');
      if (file.size === 0) return fail('Photo files cannot be empty');
    }

    const [frontUrl, backUrl] = await Promise.all([
      uploadAny(Buffer.from(await front.arrayBuffer()), 'apna-ashta/kyc'),
      uploadAny(Buffer.from(await back.arrayBuffer()), 'apna-ashta/kyc'),
    ]);
    await User.findByIdAndUpdate(
      session.user.id,
      {
        kycDocumentFront: frontUrl,
        kycDocumentBack: backUrl,
        kycStatus: 'pending',
      },
      { returnDocument: 'after' }
    );
    return ok({ frontUrl, backUrl });
  } catch (e) {
    return handleError(e);
  }
}