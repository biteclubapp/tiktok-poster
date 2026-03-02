'use client';

import { TemplateStyle } from '@/types';

interface TemplatePickerProps {
  selected: TemplateStyle;
  onSelect: (style: TemplateStyle) => void;
}

const templates: { id: TemplateStyle; name: string; desc: string; preview: string }[] = [
  {
    id: 'A',
    name: 'Clean & Modern',
    desc: 'Light bg, red top bar, DM Serif headings',
    preview: 'bg-gray-50 border-t-4 border-t-red-500',
  },
  {
    id: 'B',
    name: 'Dark & Premium',
    desc: 'Dark bg, red left bar, Cormorant Garamond',
    preview: 'bg-gray-900 border-l-4 border-l-red-500',
  },
  {
    id: 'C',
    name: 'Warm & Friendly',
    desc: 'Cream bg, rounded pills, 2-col ingredients',
    preview: 'bg-orange-50 border-b-4 border-b-red-500',
  },
];

export default function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="flex gap-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${
            selected === t.id
              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Mini preview */}
          <div className={`w-full h-12 rounded-lg mb-2 ${t.preview}`} />
          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}
