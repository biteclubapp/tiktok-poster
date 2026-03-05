import { NextRequest, NextResponse } from 'next/server';
import { generateTiktokMetadata, getApiKeyHelp, validatePromptLength } from '@/lib/genai-studio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imagePrompt = typeof body?.imagePrompt === 'string' ? body.imagePrompt.trim() : '';
    const motionPrompt = typeof body?.motionPrompt === 'string' ? body.motionPrompt.trim() : '';

    const imageValidation = validatePromptLength(imagePrompt);
    if (imageValidation) {
      return NextResponse.json({ error: `Image prompt: ${imageValidation}` }, { status: 400 });
    }

    const motionValidation = validatePromptLength(motionPrompt);
    if (motionValidation) {
      return NextResponse.json({ error: `Motion prompt: ${motionValidation}` }, { status: 400 });
    }

    const metadata = await generateTiktokMetadata(imagePrompt, motionPrompt);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Studio metadata generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate metadata';
    const apiKeyHelp = getApiKeyHelp(error);
    return NextResponse.json(
      apiKeyHelp ? { error: message, apiKeyHelp } : { error: message },
      { status: 500 }
    );
  }
}
