import { z } from 'zod';

export const ENTITY_STATUSES = ['Active', 'Maintenance', 'Inactive'] as const;
export const DEFAULT_ENTITY_CATEGORIES = ['Vehicle', 'IoT Device', 'Facility'] as const;

export const createEntitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama entitas minimal 2 karakter')
    .max(120, 'Nama entitas maksimal 120 karakter'),
  category: z
    .string()
    .trim()
    .min(1, 'Kategori / label wajib diisi'),
  status: z.enum(ENTITY_STATUSES),
  latitude: z
    .number({ error: 'Latitude harus berupa angka' })
    .refine((v) => Number.isFinite(v) && v >= -90 && v <= 90, {
      message: 'Latitude harus di antara -90 dan 90',
    }),
  longitude: z
    .number({ error: 'Longitude harus berupa angka' })
    .refine((v) => Number.isFinite(v) && v >= -180 && v <= 180, {
      message: 'Longitude harus di antara -180 dan 180',
    }),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const updateEntitySchema = createEntitySchema.extend({
  id: z.string().trim().min(1, 'ID entitas wajib ada'),
});

export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;

export interface EntityCategory {
  id: string;
  name: string;
}

export interface Entity {
  id: string;
  name: string;
  category: string | EntityCategory;
  status: string;
  latitude: number;
  longitude: number;
}

export interface EntityFilters {
  search?: string;
  category?: string;
  status?: string;
}

export function getEntityCategoryName(category: Entity['category']): string {
  return typeof category === 'string' ? category : category.name;
}
