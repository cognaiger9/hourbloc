/**
 * Types for the review feature
 */

export interface ApiBlock {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  block_type: 'planned' | 'actual';
  tag_id: string | null;
  tag?: {
    id: string;
    name: string;
    color: string;
  } | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ReviewBlock {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
  description?: string;
  duration: string; // e.g., "2h 15m"
  timeRange: string; // e.g., "14:00 - 16:15"
  tagId: string | null;
}

export interface ReviewStats {
  totalTime: string; // e.g., "8:03"
  blockCount: number;
}

