import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import {
  createVideoJob,
  getApiKeyHelp,
  isValidStudioId,
  resolveImagePath,
  startStudioVideoFromImage,
  validatePromptLength,
} from '@/lib/genai-studio';
import {
  DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
  MAX_STUDIO_VIDEO_DURATION_SECONDS,
  MIN_STUDIO_VIDEO_DURATION_SECONDS,
  parseStudioVideoDurationSeconds,
} from '@/lib/studio-models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageId = body?.imageId;
    const motionPrompt = typeof body?.motionPrompt === 'string' ? body.motionPrompt.trim() : '';
    const rawDurationSeconds = body?.durationSeconds;
    const durationSeconds = rawDurationSeconds == null
      ? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS
      : parseStudioVideoDurationSeconds(rawDurationSeconds);

    if (!isValidStudioId(imageId)) {
      return NextResponse.json({ error: 'Invalid imageId' }, { status: 400 });
    }

    const validationError = validatePromptLength(motionPrompt);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (durationSeconds === null) {
      return NextResponse.json(
        { error: `durationSeconds must be an integer between ${MIN_STUDIO_VIDEO_DURATION_SECONDS} and ${MAX_STUDIO_VIDEO_DURATION_SECONDS}.` },
        { status: 400 }
      );
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
      durationSeconds,
    });

    const job = await createVideoJob({
      imageId,
      imagePath: imageFile.imagePath,
      motionPrompt,
      durationSeconds,
      operation,
    });

    return NextResponse.json({ jobId: job.jobId, status: 'processing' });
  } catch (error) {
    console.error('Studio video start error:', error);
    const message = error instanceof Error ? error.message : 'Failed to start video generation';
    const apiKeyHelp = getApiKeyHelp(error);
    return NextResponse.json(
      apiKeyHelp ? { error: message, apiKeyHelp } : { error: message },
      { status: 500 }
    );
  }
}
