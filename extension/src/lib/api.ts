import type { Tag, TimerState } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTags(token: string): Promise<Tag[]> {
  return apiFetch<Tag[]>('/api/v1/tags/', token);
}

export async function createBlock(token: string, state: TimerState): Promise<void> {
  const now = Date.now();
  const elapsedMs = state.isPaused
    ? state.pausedAt
    : now - (state.adjustedStartTime ?? now);
  const durationSeconds = Math.max(1, Math.floor(elapsedMs / 1000));
  const title = state.tagName ? `Focus Session - ${state.tagName}` : 'Focus Session';

  await apiFetch('/api/v1/blocks/', token, {
    method: 'POST',
    body: JSON.stringify({
      title,
      start_time: new Date(state.originalStartTime!).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: durationSeconds,
      block_type: 'actual',
      tag_id: state.tagId,
      notes: null,
    }),
  });
}
