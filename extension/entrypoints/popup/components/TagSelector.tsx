import { useEffect, useState } from 'react';
import { fetchTags } from '../../../src/lib/api';
import type { Tag } from '../../../src/types';

interface Props {
  token: string;
  value: string | null;
  onChange: (tagId: string | null, tagName: string) => void;
}

export function TagSelector({ token, value, onChange }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags(token)
      .then(setTags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="h-9 w-full bg-[#e4e2dd] animate-pulse rounded-lg" />;
  }

  if (tags.length === 0) {
    return (
      <p className="text-xs text-[#6d6d6d] text-center py-1">
        No tags yet - create one in HourBloc.
      </p>
    );
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const tag = tags.find((t) => t.id === e.target.value);
        onChange(tag?.id ?? null, tag?.name ?? '');
      }}
      className="w-full px-3 py-2 text-sm bg-white border border-[#e4e2dd] rounded-lg text-[#1b1b1b] focus:outline-none focus:ring-2 focus:ring-[#3cbf6f] focus:ring-offset-1 cursor-pointer"
    >
      <option value="">No tag</option>
      {tags.map((tag) => (
        <option key={tag.id} value={tag.id}>
          {tag.name}
        </option>
      ))}
    </select>
  );
}
