import { NextRequest, NextResponse } from 'next/server';
import {
  finalizeVideoJob,
  isValidStudioId,
  loadVideoJob,
  pollVideoOperation,
  saveVideoJob,
} from '@/lib/genai-studio';

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
      });
    }

    if (job.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: job.error || 'Video generation failed',
      });
    }

    if (!job.operationPayload) {
      job.status = 'failed';
      job.error = 'Missing operation payload for this job.';
      await saveVideoJob(job);
      return NextResponse.json({ status: 'failed', error: job.error }, { status: 500 });
    }

    const operation = await pollVideoOperation(job.operationPayload);
    const updatedJob = await finalizeVideoJob(job, operation);

    if (updatedJob.status === 'completed' && updatedJob.videoId) {
      return NextResponse.json({
        status: 'completed',
        videoId: updatedJob.videoId,
        videoUrl: `/api/studio/videos/${updatedJob.videoId}`,
      });
    }

    if (updatedJob.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: updatedJob.error || 'Video generation failed',
      });
    }

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    console.error('Studio video polling error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch video status' },
      { status: 500 }
    );
  }
}
