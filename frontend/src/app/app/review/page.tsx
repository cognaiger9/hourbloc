'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useReviewBlocks } from '@/features/review/hooks/useReviewBlocks';
import { useDateNavigation } from '@/features/review/hooks/useDateNavigation';
import { useBlockOperations } from '@/features/review/hooks/useBlockOperations';
import { useTagsQuery } from '@/hooks/useTags';
import DeleteBlockModal from '@/features/review/components/DeleteBlockModal';
import ReviewHeader from '@/features/review/components/ReviewHeader';
import BlockList from '@/features/review/components/BlockList';
import { ReviewBlock } from '@/features/review/types';

const CreateBlockModal = dynamic(() => import('@/features/review/components/CreateBlockModal'), { ssr: false });

export default function ReviewPage() {
  const { currentDate, isToday, navigateDate, goToToday } = useDateNavigation();
  const { data: tags = [] } = useTagsQuery();
  const { blocks, isLoading, stats, createBlock, updateBlock, deleteBlock } =
    useReviewBlocks(currentDate);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<ReviewBlock | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Block operations with analytics
  const { handleCreateBlock, handleUpdateBlock, handleDeleteBlock } = useBlockOperations({
    createBlock,
    updateBlock,
    deleteBlock,
    onSuccess: () => setCreateModalOpen(false),
  });

  const handleDeleteClick = useCallback((block: ReviewBlock) => {
    setBlockToDelete(block);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (blockToDelete) {
      try {
        await handleDeleteBlock(blockToDelete);
        setBlockToDelete(null);
        setDeleteModalOpen(false);
      } catch {
        // Error is already handled in the hook
      }
    }
  };

  const handleEditClick = useCallback((block: ReviewBlock) => {
    setEditingBlockId(block.id);
  }, []);

  const handleSaveEdit = async (blockId: string, updatedBlock: Partial<ReviewBlock>) => {
    try {
      await handleUpdateBlock(blockId, updatedBlock);
      setEditingBlockId(null);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
  };

  const handleCreateBlockSubmit = async (data: {
    title: string;
    startTime: string;
    endTime: string;
    tagId: string | null;
    notes?: string;
  }) => {
    try {
      await handleCreateBlock(data);
    } catch {
      // Error is already handled in the hook
    }
  };

  return (
    <div className="flex-1 h-full bg-background text-foreground overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 p-6 md:p-10">
        {/* Header */}
        <ReviewHeader
          currentDate={currentDate}
          isToday={isToday}
          stats={stats}
          onNavigateDate={navigateDate}
          onGoToToday={goToToday}
          onAddBlock={() => setCreateModalOpen(true)}
        />

        {/* Content List */}
        <main className="flex flex-col gap-3">
          <BlockList
            blocks={blocks}
            isLoading={isLoading}
            editingBlockId={editingBlockId}
            tags={tags}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {blockToDelete && (
        <DeleteBlockModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setBlockToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateBlockSubmit}
        currentDate={currentDate}
      />
    </div>
  );
}
