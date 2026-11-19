'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEntity, deleteEntity, getCategories, getEntities, updateEntity } from '../api/entities.api';
import type { EntityFilters } from '../schemas/entity.schema';

export const entityKeys = {
  all: ['entities'] as const,
  list: (filters?: EntityFilters) => ['entities', 'list', filters ?? {}] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
  });
}

export function useEntitiesQuery(filters?: EntityFilters) {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => getEntities(filters),
  });
}

export function useCreateEntityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: entityKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      ]);
    },
  });
}

export function useUpdateEntityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEntity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: entityKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      ]);
    },
  });
}

export function useDeleteEntityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: entityKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      ]);
    },
  });
}
