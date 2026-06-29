/**
 * Shared API client utilities for making authenticated requests to the backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_APP || 'http://localhost:8000';

export interface ApiError {
  detail: string;
}

/**
 * Get the authentication token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 403) {
      const body: ApiError = await response.json().catch(() => ({ detail: '' }));
      if (body.detail === 'access_denied' && typeof window !== 'undefined') {
        window.location.href = '/access-required';
        return new Promise<never>(() => {});
      }
      throw new Error(body.detail || 'Forbidden');
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  } catch (error) {
    // Handle network errors (connection refused, CORS, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const isNetworkError = !navigator.onLine || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError');
      
      if (isNetworkError) {
        throw new Error(
          `Unable to connect to backend API at ${API_BASE_URL}. ` +
          `Please ensure the backend server is running and accessible. ` +
          `If running locally, start it with: uvicorn main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
    }
    
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    
    // Fallback for unknown errors
    throw new Error('An unexpected error occurred while making the API request');
  }
}

