import { NextRequest, NextResponse } from 'next/server';
import {
  generateStudioImageFromOptionalReference,
  saveGeneratedImage,
  validatePromptLength,
} from '@/lib/genai-studio';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let prompt = '';
    let referenceImage: { imageBytes: Buffer; mimeType: string } | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      prompt = typeof formData.get('prompt') === 'string' ? String(formData.get('prompt')).trim() : '';

      const file = formData.get('referenceImage');
      if (file instanceof File && file.size > 0) {
        const mimeType = file.type || 'application/octet-stream';
        if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
          return NextResponse.json(
            { error: 'Reference image must be PNG, JPG, or WEBP.' },
            { status: 400 }
          );
        }

        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: 'Reference image must be 10MB or smaller.' },
            { status: 400 }
          );
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        referenceImage = { imageBytes: bytes, mimeType };
      }
    } else {
      const body = await request.json();
      prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    }

    const validationError = validatePromptLength(prompt);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const image = await generateStudioImageFromOptionalReference(prompt, referenceImage);
    const { imageId } = await saveGeneratedImage(image);

    return NextResponse.json({
      imageId,
      imageUrl: `/api/studio/images/${imageId}`,
      promptUsed: image.promptUsed,
    });
  } catch (error) {
    console.error('Studio image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
