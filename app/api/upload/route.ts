import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadAny, uploadBuffer } from '@/lib/cloudinary';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    if (!['owner', 'admin'].includes(session.user.role)) return fail('Forbidden', 403);

    const form = await req.formData();
    const files = form.getAll('files') as File[];
    if (!files.length) return fail('No files');
    if (files.length > 10) return fail('Max 10 files per upload');

    const urls: string[] = [];
    const videoUrls: string[] = [];
    let imageCount = 0;
    let videoCount = 0;
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        if (++imageCount > 10) return fail('Max 10 photos');
        if (file.size > 5 * 1024 * 1024) return fail(`${file.name} exceeds 5MB`);
        const buf = Buffer.from(await file.arrayBuffer());
        urls.push(await uploadBuffer(buf, 'apna-ashta/properties'));
      } else if (['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
        if (++videoCount > 3) return fail('Max 3 videos');
        if (file.size > 50 * 1024 * 1024) return fail(`${file.name} exceeds 50MB`);
        const buf = Buffer.from(await file.arrayBuffer());
        videoUrls.push(await uploadAny(buf, 'apna-ashta/properties'));
      } else {
        return fail(`${file.name} must be an image or MP4, WebM, or MOV video`);
      }
    }
    return ok({ urls, videoUrls });
  } catch (e) {
    return handleError(e);
  }
}