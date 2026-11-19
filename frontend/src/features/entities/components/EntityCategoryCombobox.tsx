'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EntityCategoryComboboxProps {
  id?: string;
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
}

const LABEL_SWATCHES = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function getLabelColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LABEL_SWATCHES.length;
  return LABEL_SWATCHES[index];
}

export function EntityCategoryCombobox({
  id = 'entity-category',
  value,
  suggestions,
  onChange,
}: EntityCategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedSuggestions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of suggestions) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!map.has(key)) {
        map.set(key, trimmed);
      }
    }
    return Array.from(map.values());
  }, [suggestions]);

  const trimmedQuery = value.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  const filteredSuggestions = useMemo(() => {
    if (!lowerQuery) return normalizedSuggestions;
    return normalizedSuggestions.filter((item) => item.toLowerCase().includes(lowerQuery));
  }, [normalizedSuggestions, lowerQuery]);

  const exactMatchExists = useMemo(() => {
    if (!trimmedQuery) return true;
    return normalizedSuggestions.some((item) => item.toLowerCase() === lowerQuery);
  }, [normalizedSuggestions, trimmedQuery, lowerQuery]);

  const handleSelectOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <div className="relative flex items-center">
        <span
          className={cn(
            'pointer-events-none absolute left-3 h-2.5 w-2.5 rounded-full',
            trimmedQuery ? getLabelColor(trimmedQuery) : 'bg-muted-foreground/40',
          )}
        />
        <Input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder="Ketik atau pilih label kategori..."
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
            } else if (e.key === 'Enter' && open && filteredSuggestions.length === 1 && exactMatchExists) {
              e.preventDefault();
              handleSelectOption(filteredSuggestions[0]);
            }
          }}
          className="h-11 rounded-lg pr-9 pl-8 text-sm"
          autoComplete="off"
        />
        <Tag className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>

      {open && (
        <div
          role="listbox"
          className="z-[1300] mt-1.5 max-h-52 w-full overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
        >
          {filteredSuggestions.length > 0 ? (
            <div className="space-y-0.5">
              <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                Label tersedia
              </p>
              {filteredSuggestions.map((item) => {
                const isSelected = item.toLowerCase() === lowerQuery;
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectOption(item);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent/70 font-medium',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', getLabelColor(item))} />
                      <span>{item}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
              Tidak ada label yang cocok.
            </p>
          )}

          {!exactMatchExists && (
            <div className="mt-1 border-t pt-1">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectOption(trimmedQuery);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  Buat label baru:{' '}
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-semibold">
                    {trimmedQuery}
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
