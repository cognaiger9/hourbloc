'use client';

import { useState } from 'react';
import { useTagsQuery, useCreateTagMutation } from '@/hooks/useTags';
import { getTagColor } from '@/utils/tagColors';

interface UseTagCreationOptions {
  /**
   * Auto-select the tag after creation
   * - 'id': Select by ID (for ID-based selection)
   * - 'name': Select by name (for name-based selection)
   * - false: Don't auto-select
   */
  autoSelect?: 'id' | 'name' | false;

  /**
   * Callback when tag is created
   */
  onTagCreated?: (tag: { id: string; name: string; color: string }) => void;

  /**
   * Callback when existing tag is found
   */
  onExistingTagFound?: (tag: { id: string; name: string; color: string }) => void;
}

type ErrorType = 'validation' | 'api-error' | null;

interface UseTagCreationReturn {
  // State
  isAddingTag: boolean;
  error: string | null;
  errorType: ErrorType;

  // Actions
  openAddModal: () => void;
  closeAddModal: () => void;
  saveNewTag: (name: string, color: string) => Promise<void>;

  // For EditTagModal
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
    tagName: string;
    tagColor: string;
    onSave: (name: string, color: string) => Promise<void>;
    mode: 'add';
    error: string | null;
    errorType: ErrorType;
  };
}

export function useTagCreation(options: UseTagCreationOptions = {}): UseTagCreationReturn {
  const { autoSelect = false, onTagCreated, onExistingTagFound } = options;
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const { data: tags = [] } = useTagsQuery();
  const createTagMutation = useCreateTagMutation();

  const openAddModal = () => {
    setIsAddingTag(true);
    setError(null);
    setErrorType(null);
  };

  const closeAddModal = () => {
    setIsAddingTag(false);
    setError(null);
    setErrorType(null);
  };

  const saveNewTag = async (name: string, color: string) => {
    if (!name.trim()) {
      setError('Tag name is required');
      setErrorType('validation');
      return;
    }

    // Check if tag already exists
    const existingTag = tags.find((tag) => tag.name === name.trim());
    if (existingTag) {
      if (onExistingTagFound) {
        onExistingTagFound(existingTag);
      }
      setIsAddingTag(false);
      return;
    }

    try {
      setError(null);
      setErrorType(null);
      const result = await createTagMutation.mutateAsync({ name: name.trim(), color });
      const newTag = {
        id: result.id,
        name: result.name,
        color: result.color,
      };

      if (onTagCreated) {
        onTagCreated(newTag);
      }

      setIsAddingTag(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tag';
      setError(errorMessage);
      setErrorType('api-error');
      console.error('Error creating tag:', err);
    }
  };

  return {
    isAddingTag,
    error,
    errorType,
    openAddModal,
    closeAddModal,
    saveNewTag,
    modalProps: {
      isOpen: isAddingTag,
      onClose: closeAddModal,
      tagName: '',
      tagColor: getTagColor(tags.length),
      onSave: saveNewTag,
      mode: 'add' as const,
      error,
      errorType,
    },
  };
}
