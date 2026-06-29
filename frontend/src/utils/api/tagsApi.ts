/**
 * API client utilities for making requests to the backend
 * Note: Optimistic updates are handled by React Query hooks
 */

import { type StoredTag } from '../../types/tag';
import { apiRequest } from './client';

/**
 * API methods for tags
 * These are simple API wrappers - optimistic updates handled by useTags hooks
 */
export const tagsApi = {
  /**
   * Get all tags for the current user
   */
  async getAll(): Promise<StoredTag[]> {
    return apiRequest<StoredTag[]>('/api/v1/tags/');
  },

  /**
   * Create a new tag
   */
  async create(data: { name: string; color: string }): Promise<StoredTag> {
    return apiRequest<StoredTag>('/api/v1/tags/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing tag
   */
  async update(tagId: string, data: { name?: string; color?: string }): Promise<StoredTag> {
    return apiRequest<StoredTag>(`/api/v1/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a tag (soft delete)
   */
  async delete(tagId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/v1/tags/${tagId}`, {
      method: 'DELETE',
    });
  },
};

