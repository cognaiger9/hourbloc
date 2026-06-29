'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import EditTagModal from './EditTagModal';
import DeleteTagModal from './DeleteTagModal';
import { getTagColor } from '@/utils/tagColors';
import { useTagsQuery, useUpdateTagMutation, useDeleteTagMutation } from '@/hooks/useTags';
import { useTagCreation } from '@/hooks/useTagCreation';
import { type Tag } from '@/types/tag';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags?: string[]; // Legacy prop - tags are now loaded from localStorage
  setTags: (tags: string[]) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

// Convert Tag objects back to string array
const tagsToStringTags = (tags: Tag[]): string[] => {
  return tags.map((tag) => tag.name);
};

export default function TagManagementModal({
  isOpen,
  onClose,
  setTags,
  selectedTag,
  setSelectedTag,
}: TagManagementModalProps) {
  const tagManagementRef = useRef<HTMLDivElement>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [deletingTagIndex, setDeletingTagIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: tagObjects = [], isLoading } = useTagsQuery();
  const updateTagMutation = useUpdateTagMutation();
  const deleteTagMutation = useDeleteTagMutation();

  // Tag creation hook (no auto-select for management modal)
  const tagCreation = useTagCreation();

  // Update parent component's tags list when tags change
  useEffect(() => {
    if (tagObjects.length > 0) {
      setTags(tagsToStringTags(tagObjects));
    }
  }, [tagObjects, setTags]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close tag management modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if EditTagModal or DeleteTagModal is open - check by looking for the modal element
      const childModal = document.querySelector('[class*="z-\\[60\\]"]');
      if (childModal) {
        return;
      }
      
      // Check if click is outside the modal
      const target = event.target as Node;
      if (tagManagementRef.current && !tagManagementRef.current.contains(target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  const handleEdit = (index: number) => {
    setEditingTagIndex(index);
  };

  const handleSaveEdit = async (name: string, color: string) => {
    if (editingTagIndex !== null) {
      const tagToUpdate = tagObjects[editingTagIndex];
      const oldTagName = tagToUpdate.name;

      try {
        setError(null);
        // React Query mutation handles update and auto-updates cache
        await updateTagMutation.mutateAsync({ id: tagToUpdate.id, updates: { name, color } });

        // Update selected tag if it was the one being edited
        if (selectedTag === oldTagName) {
          setSelectedTag(name);
        }

        setEditingTagIndex(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update tag');
        console.error('Error updating tag:', err);
      }
    }
  };

  const handleCloseEditModal = () => {
    setEditingTagIndex(null);
  };

  const handleDelete = (index: number) => {
    setDeletingTagIndex(index);
  };

  const handleConfirmDelete = async () => {
    if (deletingTagIndex !== null) {
      const tagToDelete = tagObjects[deletingTagIndex];

      try {
        setError(null);
        // React Query mutation handles delete and auto-updates cache
        await deleteTagMutation.mutateAsync(tagToDelete.id);

        // If deleted tag was selected, select first available tag
        if (selectedTag === tagToDelete.name && tagObjects.length > 1) {
          const remainingTags = tagObjects.filter((t) => t.id !== tagToDelete.id);
          if (remainingTags.length > 0) {
            setSelectedTag(remainingTags[0].name);
          }
        }

        setDeletingTagIndex(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete tag');
        console.error('Error deleting tag:', err);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setDeletingTagIndex(null);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={tagManagementRef}
        className="w-full max-w-[446px] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] ring-1 ring-[#E4E2DD] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E2DD]">
          <h2 className="text-lg font-medium tracking-tight text-[#1B1B1B]">Manage Tags</h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center text-[#1B1B1B] opacity-40 hover:opacity-80 transition-opacity outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 rounded-md p-1 -mr-2"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tag List */}
        <div className="flex flex-col px-4 py-4 space-y-1 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">Loading tags...</p>
            </div>
          ) : tagObjects.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No tags yet. Create your first tag!</p>
            </div>
          ) : (
            tagObjects.map((tag, index) => (
            <div
              key={tag.id}
              className="group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                <span className="text-sm font-normal text-[#1B1B1B]">{tag.name}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(index)}
                  className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Edit tag"
                >
                  <span className="text-xs font-normal">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Delete tag"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Footer / Add New */}
        <div className="p-6 pt-2 border-t border-[#E4E2DD] mt-2">
          <button
            onClick={tagCreation.openAddModal}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#E4E2DD] rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B1B1B] opacity-60 group-hover:opacity-90">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="text-sm font-normal text-[#1B1B1B] opacity-60 group-hover:opacity-90">New Tag</span>
          </button>
        </div>
      </div>

      {/* Edit Tag Modal */}
      {editingTagIndex !== null && (
        <EditTagModal
          key={`edit-${editingTagIndex}-${tagObjects[editingTagIndex]?.name}`}
          isOpen={editingTagIndex !== null}
          onClose={handleCloseEditModal}
          tagName={tagObjects[editingTagIndex]?.name || ''}
          tagColor={tagObjects[editingTagIndex]?.color || getTagColor(0)}
          onSave={handleSaveEdit}
          mode="edit"
        />
      )}

      {/* Add Tag Modal */}
      <EditTagModal {...tagCreation.modalProps} />

      {/* Delete Tag Modal */}
      {deletingTagIndex !== null && (
        <DeleteTagModal
          key={`delete-${deletingTagIndex}-${tagObjects[deletingTagIndex]?.name}`}
          isOpen={deletingTagIndex !== null}
          onClose={handleCloseDeleteModal}
          tagName={tagObjects[deletingTagIndex]?.name || ''}
          tagColor={tagObjects[deletingTagIndex]?.color || getTagColor(0)}
          onConfirm={handleConfirmDelete}
        />
      )}

    </div>
  );
}

