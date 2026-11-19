import type { ZodError } from 'zod';

export type EntityFormField =
  | 'name'
  | 'category'
  | 'status'
  | 'latitude'
  | 'longitude';

export type FieldErrorsMap = Partial<Record<EntityFormField, string>>;

interface BackendFieldErrorItem {
  field?: string;
  code?: string;
  message?: string;
}

interface BackendValidationPayload {
  code?: string;
  message?: string;
  errors?: BackendFieldErrorItem[];
  error?: BackendValidationPayload;
}

const VALID_FIELDS = new Set<EntityFormField>([
  'name',
  'category',
  'status',
  'latitude',
  'longitude',
]);

export function mapZodErrorToFields(zodError: ZodError): FieldErrorsMap {
  const fieldErrors: FieldErrorsMap = {};

  for (const issue of zodError.issues) {
    const firstPath = issue.path[0];
    if (typeof firstPath === 'string' && VALID_FIELDS.has(firstPath as EntityFormField)) {
      const key = firstPath as EntityFormField;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
  }

  return fieldErrors;
}

function tryParseJsonObject(raw: string): BackendValidationPayload | null {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object'
      ? (parsed as BackendValidationPayload)
      : null;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        const sliced = JSON.parse(trimmed.slice(start, end + 1));
        return sliced && typeof sliced === 'object'
          ? (sliced as BackendValidationPayload)
          : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function extractServerValidationErrors(serverError: unknown): {
  fieldErrors: FieldErrorsMap;
  generalError: string | null;
} {
  if (!serverError) {
    return { fieldErrors: {}, generalError: null };
  }

  let payload: BackendValidationPayload | null = null;
  let fallbackMessage: string | null = null;

  if (typeof serverError === 'string') {
    fallbackMessage = serverError;
    payload = tryParseJsonObject(serverError);
  } else if (serverError instanceof Error) {
    fallbackMessage = serverError.message;
    payload = tryParseJsonObject(serverError.message);
    if (!payload) {
      const extra = serverError as Error & BackendValidationPayload;
      if (Array.isArray(extra.errors) || extra.error?.errors) {
        payload = extra;
      }
    }
  } else if (typeof serverError === 'object') {
    const obj = serverError as BackendValidationPayload & {
      response?: { data?: BackendValidationPayload };
      data?: BackendValidationPayload;
    };
    payload =
      obj.response?.data ??
      obj.data ??
      obj.error ??
      obj;
    fallbackMessage =
      obj.message ??
      obj.response?.data?.message ??
      obj.data?.message ??
      payload?.message ??
      null;
  }

  const errorsList = Array.isArray(payload?.errors)
    ? payload.errors
    : Array.isArray(payload?.error?.errors)
      ? payload.error.errors
      : [];

  const fieldErrors: FieldErrorsMap = {};
  for (const item of errorsList) {
    const rawField = item.field?.trim().toLowerCase();
    if (rawField && VALID_FIELDS.has(rawField as EntityFormField)) {
      const key = rawField as EntityFormField;
      if (!fieldErrors[key] && item.message) {
        fieldErrors[key] = item.message;
      }
    }
  }

  const hasAnyFieldError = Object.keys(fieldErrors).length > 0;
  const generalError = hasAnyFieldError
    ? null
    : payload?.message || payload?.error?.message || fallbackMessage || null;

  return { fieldErrors, generalError };
}
