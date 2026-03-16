import cron from 'node-cron';
import { randomUUID } from 'crypto';
import { getDuePosts, updatePostStatus, type ScheduledPost } from './db';
import { generateCarousel } from '@/templates/render';
import { uploadImageToCloudflare } from './cloudflare-images';
import { getValidTokens, publishCarousel } from './tiktok';
import type { DishData, TemplateStyle } from '@/types';
import { buildDescriptiveSlidePrefix, persistGeneratedSlides } from './carousel-slides';

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log('[Scheduler] Starting — checking for due posts every 60s');

  // Run every 60 seconds
  cron.schedule('* * * * *', async () => {
    try {
      await processDuePosts();
    } catch (err) {
      console.error('[Scheduler] Error processing due posts:', err);
    }
  });
}

async function processDuePosts() {
  const duePosts = getDuePosts();
  if (duePosts.length === 0) return;

  console.log(`[Scheduler] Found ${duePosts.length} due post(s)`);

  for (const post of duePosts) {
    await processPost(post);
  }
}

async function processPost(post: ScheduledPost) {
  const postId = post.id;
  console.log(`[Scheduler] Processing post ${postId}`);

  try {
    // Step 1: Generate carousel
    updatePostStatus(postId, 'generating');

    const dishData: DishData = JSON.parse(post.dish_data);
    const template = post.template as TemplateStyle;

    const slideBuffers = await generateCarousel(dishData, template);
    const batchId = randomUUID();
    const filenamePrefix = buildDescriptiveSlidePrefix(
      'scheduled',
      dishData.recipeName,
      `template-${template}`
    );
    const persistedSlides = await persistGeneratedSlides(slideBuffers, batchId, filenamePrefix);
    const slideUrls = persistedSlides.slides.map((slide) => slide.previewUrl);

    updatePostStatus(postId, 'publishing', { slide_urls: slideUrls });

    // Step 2: Upload to Cloudflare + publish to TikTok
    const tokens = await getValidTokens();
    if (!tokens) {
      updatePostStatus(postId, 'failed', {
        error: 'TikTok not connected — slides generated but not published',
        slide_urls: slideUrls,
      });
      console.log(`[Scheduler] Post ${postId} failed: TikTok not connected`);
      return;
    }

    const publicUrls: string[] = [];
    for (let i = 0; i < persistedSlides.slides.length; i++) {
      const slide = persistedSlides.slides[i];
      const publicUrl =
        slide.publicUrl ||
        await uploadImageToCloudflare(slideBuffers[i], slide.filename);
      publicUrls.push(publicUrl);
    }

    const result = await publishCarousel(tokens.access_token, publicUrls, post.caption);

    updatePostStatus(postId, 'published', {
      publish_id: result.publish_id,
      slide_urls: slideUrls,
    });
    console.log(`[Scheduler] Post ${postId} published: ${result.publish_id}`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    updatePostStatus(postId, 'failed', { error: errorMsg });
    console.error(`[Scheduler] Post ${postId} failed:`, errorMsg);
  }
}
