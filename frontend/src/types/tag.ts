/**
 * Tag type definitions
 */

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface StoredTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

