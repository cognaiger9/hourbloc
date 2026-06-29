'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditTagModal from '@/components/EditTagModal';
import { useTagsQuery } from '@/hooks/useTags';
import { useTagCreation } from '@/hooks/useTagCreation';
import { TagDropdown } from '@/components/TagDropdown';
import { calculateOptimalModalPosition } from '@/features/calendar/utils/modalPosition';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';

interface BlockModalProps {
  block: CalendarBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: CalendarBlock) => Promise<void>;
  onDelete?: (blockId: string) => void;
  position?: { 
    x: number; 
    y: number; 
    blockBounds?: { left: number; top: number; width: number; height: number };
  };
}

export default function BlockModal({
  block,
  isOpen,
  onClose,
  onSave,
  onDelete,
  position,
}: BlockModalProps) {
  const router = useRouter();
  const { data: tags = [] } = useTagsQuery();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);

  // Tag creation hook (name-based selection for BlockModal)
  const tagCreation = useTagCreation({
    onTagCreated: (newTag) => setTag(newTag.name),
    onExistingTagFound: (existingTag) => setTag(existingTag.name),
  });

  // Update form when block changes
  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setDescription(block.description);
      setTag(block.tag);
    } else {
      setTitle('');
      setDescription('');
      setTag(tags.length > 0 ? tags[0].name : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id, block?.title, block?.description, block?.tag, tags.map(t => t.id).join(',')]);


  // Calculate optimal position for floating panel
  useEffect(() => {
    if (!isOpen || !position) {
      setCalculatedPosition(null);
      return;
    }

    // Use requestAnimationFrame to ensure modal is rendered before calculating position
    const calculatePosition = () => {
      if (!modalRef.current) {
        // Retry if modal not yet rendered
        requestAnimationFrame(calculatePosition);
        return;
      }

      const modal = modalRef.current;
      const modalRect = modal.getBoundingClientRect();
      const modalWidth = modalRect.width || 320; // Fallback to w-80 (320px) if not yet measured
      const modalHeight = modalRect.height || 400; // Fallback estimate

      const finalPosition = calculateOptimalModalPosition(
        position,
        modalWidth,
        modalHeight
      );

      if (finalPosition) {
        setCalculatedPosition(finalPosition);
        setIsPositionCalculated(true);
      }
    };

    requestAnimationFrame(calculatePosition);
  }, [isOpen, position]);

  // Reset position calculated flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsPositionCalculated(false);
      setCalculatedPosition(null);
    }
  }, [isOpen]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      // Don't close if EditTagModal is open (check for z-[60] which is EditTagModal's z-index)
      const childModal = document.querySelector('.z-\\[60\\]');
      if (childModal) {
        return;
      }

      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        // Stop propagation to prevent grid click handler from firing
        event.stopPropagation();
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      // Use a delay to ensure modal is fully positioned before listening for outside clicks
      // This prevents the opening click from being detected as an outside click
      const timeoutId = setTimeout(() => {
        // Use capture phase to catch the event before it reaches grid
        document.addEventListener('mousedown', handleClickOutsideModal, { capture: true });
      }, 350); // Increased from 100ms to allow position calculation and debounce

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutsideModal, { capture: true });
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !block) return null;

  const handleSave = () => {
    const updatedBlock: CalendarBlock = {
      ...block,
      title: title.trim(),
      description: description.trim(),
      tag,
      // Keep isNewlyCreated as-is - let handleBlockSave in app/page.tsx handle marking it as saved
    };
    
    // Trigger save without awaiting (fire-and-forget for async API call)
    // Store handles errors via revert logic
    onSave(updatedBlock);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && block.id) {
      onDelete(block.id);
      onClose();
    }
  };

  const handleStartSession = () => {
    // Build query parameters
    const params = new URLSearchParams();

    if (tag) {
      params.set('tag', tag);
    }
    if (title.trim()) {
      params.set('title', title.trim());
    }
    if (description.trim()) {
      params.set('notes', description.trim());
    }

    // Navigate to focus screen with query params
    router.push(`/app/focus?${params.toString()}`);

    // Close modal after navigation is initiated
    onClose();
  };


  // Use calculated position - hide modal until position is calculated to prevent flash
  const panelStyle: React.CSSProperties = calculatedPosition && isPositionCalculated
    ? {
        position: 'fixed',
        top: `${calculatedPosition.top}px`,
        left: `${calculatedPosition.left}px`,
        zIndex: 1000,
        opacity: 1,
        transition: 'opacity 0.1s ease-in',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        opacity: 0,
        pointerEvents: 'none',
        visibility: 'hidden',
      };

  return (
    <div
      ref={modalRef}
      data-block-modal="true"
      className="w-80 bg-surface border border-border rounded-lg shadow-xl flex flex-col max-h-[90vh]"
      style={panelStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Event Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-background rounded-md transition-colors text-foreground-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(90vh-120px)]">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            className="w-full px-3 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green placeholder:text-foreground-secondary"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description"
            rows={6}
            data-private
            className="w-full px-3 py-2 text-sm text-foreground bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green resize-none placeholder:text-foreground-secondary"
          />
        </div>

        {/* Tag Selector */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Tag
          </label>
          <TagDropdown
            value={tags.find(t => t.name === tag)?.id || null}
            onChange={(tagId) => {
              const selectedTag = tags.find(t => t.id === tagId);
              if (selectedTag) setTag(selectedTag.name);
            }}
            onAddNewTag={tagCreation.openAddModal}
            isOpen={isDropdownOpen}
            onToggle={setIsDropdownOpen}
            variant="default"
            placeholder="Select a tag"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        {/* Left side: Start Session button (only show for existing blocks) */}
        <div className="flex items-center gap-2">
          {block.id && !block.isNewlyCreated && (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-light text-accent-green hover:bg-green-hover hover:text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          )}
        </div>

        {/* Right side: Delete and Save buttons */}
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-danger hover:bg-background rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-accent-green text-white hover:bg-green-hover rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Edit Tag Modal */}
      <EditTagModal {...tagCreation.modalProps} />
    </div>
  );
}

