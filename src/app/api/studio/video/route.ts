import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import {
  createVideoJob,
  isValidStudioId,
  resolveImagePath,
  startStudioVideoFromImage,
  validatePromptLength,
} from '@/lib/genai-studio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageId = body?.imageId;
    const motionPrompt = typeof body?.motionPrompt === 'string' ? body.motionPrompt.trim() : '';

    if (!isValidStudioId(imageId)) {
      return NextResponse.json({ error: 'Invalid imageId' }, { status: 400 });
    }

    const validationError = validatePromptLength(motionPrompt);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const imageFile = await resolveImagePath(imageId);
    if (!imageFile) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = await readFile(imageFile.imagePath);
    const operation = await startStudioVideoFromImage({
      prompt: motionPrompt,
      imageBytes: imageBuffer,
      mimeType: imageFile.mimeType,
    });

    const job = await createVideoJob({
      imageId,
      imagePath: imageFile.imagePath,
      motionPrompt,
      operation,
    });

    return NextResponse.json({ jobId: job.jobId, status: 'processing' });
  } catch (error) {
    console.error('Studio video start error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start video generation' },
      { status: 500 }
    );
  }
}
