'use client';

import { useState, useEffect } from 'react';
import { Meal } from '@/types';
import DishCard from './DishCard';

interface DishBrowserProps {
  selectedMeal: Meal | null;
  onSelectMeal: (meal: Meal) => void;
  onSelectHeroImage: (url: string) => void;
}

export default function DishBrowser({
  selectedMeal,
  onSelectMeal,
  onSelectHeroImage,
}: DishBrowserProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  async function fetchDishes(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const res = await fetch(`/api/supabase/dishes?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dishes');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchDishes(search);
  }

  function handleSelectMeal(meal: Meal) {
    onSelectMeal(meal);
    // Auto-select first image as hero
    const firstMedia = meal.media[0];
    if (firstMedia?.signed_url) {
      onSelectHeroImage(firstMedia.signed_url);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full" />
          <span className="ml-3">Loading dishes...</span>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => fetchDishes()}
              className="mt-2 text-sm text-gray-500 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-xs text-gray-400 mb-3">{meals.length} dishes found</p>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto min-h-0 flex-1 pb-4 auto-rows-min">
            {meals.map((meal) => (
              <DishCard
                key={meal.id}
                meal={meal}
                isSelected={selectedMeal?.id === meal.id}
                onSelect={() => handleSelectMeal(meal)}
              />
            ))}
          </div>

          {/* Photo filmstrip for selected dish */}
          {selectedMeal && selectedMeal.media.length > 1 && (
            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Choose hero image ({selectedMeal.media.length} photos)
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedMeal.media.map((media) => (
                  <button
                    key={media.id}
                    onClick={() => media.signed_url && onSelectHeroImage(media.signed_url)}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-red-500 transition-colors"
                  >
                    {media.signed_url ? (
                      <img
                        src={media.signed_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
