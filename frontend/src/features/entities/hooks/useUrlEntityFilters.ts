'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { EntityFilters, EntityStatus } from '../schemas/entity.schema';
import { useDebouncedValue } from './useDebouncedValue';

const VALID_STATUSES = new Set<string>(['Active', 'Maintenance', 'Inactive']);

function parseFiltersFromParams(params: URLSearchParams): EntityFilters {
  const search = params.get('search')?.trim() ?? '';
  const category = params.get('category')?.trim() ?? '';
  const rawStatus = params.get('status')?.trim() ?? '';
  const status: EntityStatus | '' = VALID_STATUSES.has(rawStatus)
    ? (rawStatus as EntityStatus)
    : '';

  return {
    search,
    category,
    status,
  };
}

export function useUrlEntityFilters() {
  const searchParams = useSearchParams();

  const [rawFilters, setRawFilters] = useState<EntityFilters>(() =>
    parseFiltersFromParams(searchParams),
  );

  const debouncedSearch = useDebouncedValue(rawFilters.search ?? '', 300);
  const isDebouncing = (rawFilters.search ?? '').trim() !== debouncedSearch.trim();

  const normalizedFilters = useMemo<EntityFilters>(() => {
    const next: EntityFilters = {};
    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) next.search = trimmedSearch;
    if (rawFilters.category?.trim()) next.category = rawFilters.category.trim();
    if (rawFilters.status?.trim()) next.status = rawFilters.status.trim() as EntityStatus;
    return next;
  }, [debouncedSearch, rawFilters.category, rawFilters.status]);

  const hasActiveFilter = useMemo(
    () =>
      Boolean(
        normalizedFilters.search ||
          normalizedFilters.category ||
          normalizedFilters.status,
      ),
    [normalizedFilters],
  );

  // Sinkronkan state filter ke URL query string (sistem eksternal browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (normalizedFilters.search) {
      params.set('search', normalizedFilters.search);
    } else {
      params.delete('search');
    }

    if (normalizedFilters.category) {
      params.set('category', normalizedFilters.category);
    } else {
      params.delete('category');
    }

    if (normalizedFilters.status) {
      params.set('status', normalizedFilters.status);
    } else {
      params.delete('status');
    }

    const nextQuery = params.toString();
    const nextUrl = `${url.pathname}${nextQuery ? `?${nextQuery}` : ''}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [normalizedFilters]);

  const updateRawFilters = useCallback((next: EntityFilters) => {
    setRawFilters(next);
  }, []);

  return {
    rawFilters,
    setRawFilters: updateRawFilters,
    normalizedFilters,
    isDebouncing,
    hasActiveFilter,
  };
}
