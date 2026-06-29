/**
 * Backlog feature types
 */

export interface BacklogTask {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export type TabType = 'active' | 'completed';
