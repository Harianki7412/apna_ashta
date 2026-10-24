import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    if (!['owner', 'admin'].includes((session.user as any).role)) return fail('Forbidden', 403);

    const form = await req.formData();
    const files = form.getAll('files') as File[];
    if (!files.length) return fail('No files');
    if (files.length > 10) return fail('Max 10 files');

    const urls: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) return fail(`${file.name} exceeds 5MB`);
      if (!file.type.startsWith('image/')) return fail(`${file.name} is not an image`);
      const buf = Buffer.from(await file.arrayBuffer());
      urls.push(await uploadBuffer(buf, 'apna-ashta/properties'));
    }
    return ok({ urls });
  } catch (e) {
    return handleError(e);
  }
}