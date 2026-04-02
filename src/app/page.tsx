'use client';

import { useState } from 'react';
import { Meal, TemplateStyle, DishData } from '@/types';
import DishBrowser from '@/components/DishBrowser';
import TemplatePicker from '@/components/TemplatePicker';
import CarouselPreview from '@/components/CarouselPreview';
import PostControls from '@/components/PostControls';
import TikTokAuth from '@/components/TikTokAuth';
import RedditAuth from '@/components/RedditAuth';
import InstagramAuth from '@/components/InstagramAuth';
import ScheduleModal from '@/components/ScheduleModal';

function mealToDishData(meal: Meal, heroImageUrl: string): DishData {
  const recipe = meal.recipes[0];
  const profile = meal.profile;
  const cookName = profile?.username || 'unknown';

  // ingredients and instructions are already parsed as string[] by the API
  const ingredients = recipe?.ingredients || [];
  const instructions = recipe?.instructions || [];

  return {
    meal,
    heroImageUrl,
    recipeName: recipe?.title || meal.caption || 'Untitled Recipe',
    cookName,
    cookInitial: cookName.charAt(0).toUpperCase(),
    cookTime: recipe?.cook_time ? `${recipe.cook_time} min` : '30 min',
    ingredients,
    instructions,
    stepCount: instructions.length,
    ingredientCount: ingredients.length,
  };
}

export default function Home() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [template, setTemplate] = useState<TemplateStyle>('A');
  const [slides, setSlides] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [redditConnected, setRedditConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingReddit, setPublishingReddit] = useState(false);
  const [publishingInstagram, setPublishingInstagram] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingCaption, setSchedulingCaption] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const dishData = selectedMeal
    ? { ...mealToDishData(selectedMeal, heroImageUrl), recipeName: editedTitle }
    : undefined;

  function handleSelectMeal(meal: Meal) {
    setSelectedMeal(meal);
    const recipe = meal.recipes[0];
    setEditedTitle(recipe?.title || meal.caption || 'Untitled Recipe');
    // Clear old slides so the preview doesn't show stale content from a previous dish
    setSlides([]);
    // Reset hero image — DishBrowser will auto-set it via onSelectHeroImage callback
    setHeroImageUrl('');
  }

  async function generateCarousel() {
    if (!selectedMeal) return;

    setGenerating(true);
    setSlides([]);

    try {
      const dishData = { ...mealToDishData(selectedMeal, heroImageUrl), recipeName: editedTitle };
      const res = await fetch('/api/carousel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishData, template }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setSlides(data.slides);
    } catch (e) {
      alert('Generation failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  }

  async function publishToTikTok(caption: string) {
    if (slides.length === 0) return;

    setPublishing(true);
    try {
      const res = await fetch('/api/tiktok/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, caption }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Publishing failed');
      }

      const data = await res.json();
      alert(`Published! Post ID: ${data.publish_id}`);
    } catch (e) {
      alert('Publishing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setPublishing(false);
    }
  }

  async function publishToReddit(title: string, subreddit: string) {
    if (!selectedMeal) return;

    setPublishingReddit(true);
    try {
      // Generate Reddit-specific carousel (no CTA, no branding)
      const dishData = { ...mealToDishData(selectedMeal, heroImageUrl), recipeName: editedTitle };
      const genRes = await fetch('/api/carousel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishData, template, platform: 'reddit' }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || 'Reddit carousel generation failed');
      }

      const genData = await genRes.json();

      // Publish to Reddit
      const res = await fetch('/api/reddit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: genData.slides,
          title,
          subreddit,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Reddit publishing failed');
      }

      const data = await res.json();
      alert(`Posted to Reddit! ${data.url || 'Check your profile.'}`);
    } catch (e) {
      alert('Reddit publishing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setPublishingReddit(false);
    }
  }

  async function publishToInstagram(caption: string) {
    if (slides.length === 0) return;

    setPublishingInstagram(true);
    try {
      // Instagram uses the already-generated slides (same as TikTok — with branding, CTA slide)
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          caption,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Instagram publishing failed');
      }

      const data = await res.json();
      alert(`Posted to Instagram! Post ID: ${data.id}`);
    } catch (e) {
      alert('Instagram publishing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setPublishingInstagram(false);
    }
  }

  function handleOpenSchedule(caption: string) {
    setSchedulingCaption(caption);
    setScheduleModalOpen(true);
  }

  async function handleSchedule(scheduledAt: number) {
    if (!selectedMeal) return;
    setScheduling(true);
    try {
      const dishData = { ...mealToDishData(selectedMeal, heroImageUrl), recipeName: editedTitle };
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishData,
          template,
          caption: schedulingCaption,
          scheduledAt,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scheduling failed');
      }
      setScheduleModalOpen(false);
      alert('Post scheduled! View it on the Schedule page.');
    } catch (e) {
      alert('Scheduling failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="max-w-7xl mx-auto flex justify-end gap-3">
          <div className="w-72">
            <RedditAuth onStatusChange={setRedditConnected} />
          </div>
          <div className="w-72">
            <InstagramAuth onStatusChange={setInstagramConnected} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left panel: Dish Browser */}
          <div className="col-span-5 bg-white rounded-2xl border border-gray-200 p-4 max-h-[calc(100vh-140px)] flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Choose a Dish
            </h2>
            <DishBrowser
              selectedMeal={selectedMeal}
              onSelectMeal={handleSelectMeal}
              onSelectHeroImage={setHeroImageUrl}
            />
          </div>

          {/* Right panel: Template + Preview + Controls */}
          <div className="col-span-7 space-y-6">
            {/* Template Picker */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Pick a Template
              </h2>
              <TemplatePicker selected={template} onSelect={setTemplate} />

              {/* Editable title */}
              {selectedMeal && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Recipe Title</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={generateCarousel}
                disabled={!selectedMeal || generating}
                className="mt-4 w-full px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Generating slides...
                  </span>
                ) : (
                  `Generate Carousel${selectedMeal ? ` for "${selectedMeal.recipes[0]?.title || selectedMeal.caption || 'dish'}"` : ''}`
                )}
              </button>
            </div>

            {/* Carousel Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Preview & Post
              </h2>
              <CarouselPreview slides={slides} loading={generating} />
            </div>

            {/* Post Controls */}
            {selectedMeal && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <PostControls
                  slides={slides}
                  recipeName={selectedMeal?.recipes[0]?.title || 'recipe'}
                  dishData={dishData}
                  onPublish={publishToTikTok}
                  onSchedule={handleOpenSchedule}
                  onPublishReddit={publishToReddit}
                  onPublishInstagram={publishToInstagram}
                  tiktokConnected={tiktokConnected}
                  redditConnected={redditConnected}
                  instagramConnected={instagramConnected}
                  publishing={publishing}
                  publishingReddit={publishingReddit}
                  publishingInstagram={publishingInstagram}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
        scheduling={scheduling}
      />
    </div>
  );
}
