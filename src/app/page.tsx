'use client';

import { useState } from 'react';
import { Meal, TemplateStyle, DishData } from '@/types';
import DishBrowser from '@/components/DishBrowser';
import TemplatePicker from '@/components/TemplatePicker';
import CarouselPreview from '@/components/CarouselPreview';
import PostControls from '@/components/PostControls';
import TikTokAuth from '@/components/TikTokAuth';

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
  const [publishing, setPublishing] = useState(false);

  function handleSelectMeal(meal: Meal) {
    setSelectedMeal(meal);
    const recipe = meal.recipes[0];
    setEditedTitle(recipe?.title || meal.caption || 'Untitled Recipe');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">BiteClub TikTok Poster</h1>
          </div>
          <div className="w-72">
            <TikTokAuth onStatusChange={setTiktokConnected} />
          </div>
        </div>
      </header>

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
                    Generating 4 slides...
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
            {slides.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <PostControls
                  slides={slides}
                  recipeName={selectedMeal?.recipes[0]?.title || 'recipe'}
                  onPublish={publishToTikTok}
                  tiktokConnected={tiktokConnected}
                  publishing={publishing}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
