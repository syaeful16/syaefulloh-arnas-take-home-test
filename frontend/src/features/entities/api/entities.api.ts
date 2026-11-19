import { API_BASE_URL, getApiErrorMessage, unwrapApiData } from '@/shared/api/http';
import type {
  CreateEntityInput,
  Entity,
  EntityCategory,
  EntityFilters,
  UpdateEntityInput,
} from '../schemas/entity.schema';

const ENTITIES_ENDPOINT = `${API_BASE_URL}/api/entities`;
const CATEGORIES_ENDPOINT = `${API_BASE_URL}/api/categories`;

function throwEntityApiError(json: unknown, fallbackMessage: string): never {
  if (
    json &&
    typeof json === 'object' &&
    'errors' in json &&
    Array.isArray((json as { errors?: unknown }).errors)
  ) {
    throw new Error(JSON.stringify(json));
  }

  throw new Error(getApiErrorMessage(json, fallbackMessage));
}

export async function getCategories(): Promise<EntityCategory[]> {
  const res = await fetch(CATEGORIES_ENDPOINT, { cache: 'no-store' });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(json, `Gagal memuat kategori (${res.status})`));
  }

  const data = unwrapApiData<EntityCategory[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function getEntities(filters?: EntityFilters): Promise<Entity[]> {
  const url = new URL(ENTITIES_ENDPOINT);
  if (filters?.search) url.searchParams.set('search', filters.search);
  if (filters?.category) url.searchParams.set('category', filters.category);
  if (filters?.status) url.searchParams.set('status', filters.status);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(json, `Gagal memuat entitas (${res.status})`));
  }

  const data = unwrapApiData<Entity[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function createEntity(payload: CreateEntityInput): Promise<Entity> {
  const res = await fetch(ENTITIES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throwEntityApiError(json, `Gagal membuat entitas (${res.status})`);
  }

  return unwrapApiData<Entity>(json);
}

export async function updateEntity({ id, ...payload }: UpdateEntityInput): Promise<Entity> {
  const res = await fetch(`${ENTITIES_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throwEntityApiError(json, `Gagal memperbarui entitas (${res.status})`);
  }

  return unwrapApiData<Entity>(json);
}

export async function deleteEntity(id: string): Promise<void> {
  const res = await fetch(`${ENTITIES_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(getApiErrorMessage(json, `Gagal menghapus entitas (${res.status})`));
  }
}
