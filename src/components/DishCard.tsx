'use client';

import { Meal } from '@/types';

interface DishCardProps {
  meal: Meal;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DishCard({ meal, isSelected, onSelect }: DishCardProps) {
  const recipe = meal.recipes[0];
  const heroMedia = meal.media[0];
  const imageUrl = heroMedia?.signed_url;

  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border-2 transition-all text-left w-full ${
        isSelected
          ? 'border-red-500 ring-2 ring-red-500/30 scale-[1.02]'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Photo */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe?.title || meal.caption || 'Dish photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
            <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              ✓
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate">
          {recipe?.title || meal.caption || 'Untitled dish'}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {recipe?.cook_time && (
            <span>{recipe.cook_time} min</span>
          )}
          {meal.rating && (
            <>
              <span>·</span>
              <span>{'⭐'.repeat(Math.min(meal.rating, 5))}</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">
          by @{meal.profile?.username || 'unknown'}
        </p>
      </div>
    </button>
  );
}
