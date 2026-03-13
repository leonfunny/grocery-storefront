'use client';

import { useTranslations } from 'next-intl';

export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'sortNewest', field: 'DATE', direction: 'DESC' },
  { value: 'price_asc', label: 'sortPrice', field: 'PRICE', direction: 'ASC' },
  { value: 'price_desc', label: 'sortPriceDesc', field: 'PRICE', direction: 'DESC' },
  { value: 'name_asc', label: 'sortName', field: 'NAME', direction: 'ASC' },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations('products');

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-muted-foreground)' }}>
        {t('sortBy')}
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border px-3 py-2.5 text-sm bg-transparent transition-colors duration-fast focus:outline-none focus-visible:ring-2 cursor-pointer"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-foreground)',
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.label as any)}
          </option>
        ))}
      </select>
    </div>
  );
}
