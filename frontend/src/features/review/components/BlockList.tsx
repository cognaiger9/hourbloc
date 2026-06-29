'use client';

import { ReviewBlock } from '../types';
import BlockEditor from './BlockEditor';
import BlockItem from './BlockItem';

interface BlockListProps {
  blocks: ReviewBlock[];
  isLoading: boolean;
  editingBlockId: string | null;
  tags: Array<{ id: string; name: string }>;
  onEdit: (block: ReviewBlock) => void;
  onDelete: (block: ReviewBlock) => void;
  onSaveEdit: (blockId: string, updatedBlock: Partial<ReviewBlock>) => Promise<void>;
  onCancelEdit: () => void;
}

export default function BlockList({
  blocks,
  isLoading,
  editingBlockId,
  tags,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
}: BlockListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-foreground-secondary">Loading blocks...</p>
      </div>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        if (editingBlockId === block.id) {
          return (
            <BlockEditor
              key={block.id}
              block={block}
              tags={tags}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          );
        }
        return (
          <BlockItem key={block.id} block={block} onEdit={onEdit} onDelete={onDelete} />
        );
      })}

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-foreground-secondary">
            No time blocks recorded for this day.
          </p>
        </div>
      )}
    </>
  );
}
