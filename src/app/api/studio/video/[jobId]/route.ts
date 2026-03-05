import { NextRequest, NextResponse } from 'next/server';
import {
  finalizeVideoJob,
  getApiKeyHelp,
  isValidStudioId,
  loadVideoJob,
  pollVideoOperation,
  saveVideoJob,
} from '@/lib/genai-studio';
import { DEFAULT_STUDIO_VIDEO_DURATION_SECONDS } from '@/lib/studio-models';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!isValidStudioId(jobId)) {
      return NextResponse.json({ error: 'Invalid jobId' }, { status: 400 });
    }

    const job = await loadVideoJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status === 'completed' && job.videoId) {
      return NextResponse.json({
        status: 'completed',
        videoId: job.videoId,
        videoUrl: `/api/studio/videos/${job.videoId}`,
        durationSeconds: job.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
      });
    }

    if (job.status === 'failed') {
      const apiKeyHelp = getApiKeyHelp(job.error || '');
      return NextResponse.json({
        status: 'failed',
        error: job.error || 'Video generation failed',
        durationSeconds: job.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
        ...(apiKeyHelp ? { apiKeyHelp } : {}),
      });
    }

    if (!job.operationPayload) {
      job.status = 'failed';
      job.error = 'Missing operation payload for this job.';
      await saveVideoJob(job);
      const apiKeyHelp = getApiKeyHelp(job.error);
      return NextResponse.json(
        { status: 'failed', error: job.error, ...(apiKeyHelp ? { apiKeyHelp } : {}) },
        { status: 500 }
      );
    }

    const operation = await pollVideoOperation(job.operationPayload);
    const updatedJob = await finalizeVideoJob(job, operation);

    if (updatedJob.status === 'completed' && updatedJob.videoId) {
      return NextResponse.json({
        status: 'completed',
        videoId: updatedJob.videoId,
        videoUrl: `/api/studio/videos/${updatedJob.videoId}`,
        durationSeconds: updatedJob.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
      });
    }

    if (updatedJob.status === 'failed') {
      const apiKeyHelp = getApiKeyHelp(updatedJob.error || '');
      return NextResponse.json({
        status: 'failed',
        error: updatedJob.error || 'Video generation failed',
        durationSeconds: updatedJob.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
        ...(apiKeyHelp ? { apiKeyHelp } : {}),
      });
    }

    return NextResponse.json({
      status: 'processing',
      durationSeconds: updatedJob.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
    });
  } catch (error) {
    console.error('Studio video polling error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch video status';
    const apiKeyHelp = getApiKeyHelp(error);
    return NextResponse.json(
      apiKeyHelp ? { error: message, apiKeyHelp } : { error: message },
      { status: 500 }
    );
  }
}
