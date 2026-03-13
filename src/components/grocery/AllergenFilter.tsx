'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, X } from 'lucide-react';

const EU_14_ALLERGENS = [
  'cereals', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans', 'milk',
  'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const;

interface AllergenFilterProps {
  selected: string[];
  onChange: (allergens: string[]) => void;
}

export function AllergenFilter({ selected, onChange }: AllergenFilterProps) {
  const t = useTranslations('allergens');
  const tProducts = useTranslations('products');

  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((a) => a !== code));
    } else {
      onChange([...selected, code]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-allergen)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {tProducts('allergenFilter')}
          </span>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs py-2 hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {tProducts('clearFilters')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {EU_14_ALLERGENS.map((code) => {
          const isActive = selected.includes(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-fast"
              style={{
                borderColor: isActive ? 'var(--color-allergen)' : 'var(--color-border)',
                backgroundColor: isActive ? 'var(--color-allergen-bg)' : 'transparent',
                color: isActive ? 'var(--color-allergen)' : 'var(--color-muted-foreground)',
              }}
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Remove' : 'Exclude'} ${t(code)}`}
            >
              {isActive && <X className="w-3 h-3" />}
              {t(code)}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          {tProducts('showingWithout') || 'Showing products without'}: {selected.map((a) => t(a as any)).join(', ')}
        </p>
      )}
    </div>
  );
}
