export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8080';

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

export function unwrapApiData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data;
  }
  return payload as T;
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim().length > 0) {
      return msg;
    }
  }
  return fallback;
}
