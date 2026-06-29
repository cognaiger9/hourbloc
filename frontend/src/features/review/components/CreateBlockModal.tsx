'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import EditTagModal from '@/components/EditTagModal';
import { useTagsQuery } from '@/hooks/useTags';
import { useTagCreation } from '@/hooks/useTagCreation';
import { TagDropdown } from '@/components/TagDropdown';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    startTime: string;
    endTime: string;
    tagId: string | null;
    notes?: string;
  }) => Promise<void>;
  currentDate: Date;
}

export default function CreateBlockModal({
  isOpen,
  onClose,
  onSave,
  currentDate,
}: CreateBlockModalProps) {
  const { data: tags = [] } = useTagsQuery();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Tag creation hook
  const tagCreation = useTagCreation({
    onTagCreated: (tag) => setSelectedTagId(tag.id),
    onExistingTagFound: (tag) => setSelectedTagId(tag.id),
  });

  // Initialize tag when tags load
  useEffect(() => {
    if (tags.length > 0 && selectedTagId === null) {
      setSelectedTagId(tags[0].id);
    }
  }, [tags, selectedTagId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setSelectedTagId(tags.length > 0 ? tags[0].id : null);
      setNotes('');
      setValidationError(null);
      setIsSaving(false);
    }
  }, [isOpen, tags]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if EditTagModal is open (check for z-[60] which is EditTagModal's z-index)
      const childModal = document.querySelector('.z-\\[60\\]');
      if (childModal) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);


  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !tagCreation.isAddingTag) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, tagCreation.isAddingTag, onClose]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setValidationError('Title is required');
      return false;
    }

    if (!startTime || !endTime) {
      setValidationError('Start and end times are required');
      return false;
    }

    // Allow times to be equal is still invalid (no zero-duration blocks)
    if (startTime === endTime) {
      setValidationError('Block must have a duration greater than 0 minutes');
      return false;
    }

    // Note: We now allow end time < start time (crosses midnight)
    setValidationError(null);
    return true;
  };

  const crossesMidnight = (): boolean => {
    if (!startTime || !endTime) return false;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes < startMinutes;
  };

  const calculateDuration = (): string => {
    if (!startTime || !endTime) return '';

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // If crosses midnight, add 24 hours to end time
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        startTime,
        endTime,
        tagId: selectedTagId,
        notes: notes.trim() || undefined,
      });
      // onClose is called by parent after successful save
    } catch (error) {
      console.error('Failed to save block:', error);
      setValidationError('Failed to create block. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };


  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[500px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E2DD]">
          <div>
            <h2 className="text-lg font-semibold text-[#1B1B1B]">Add Time Block</h2>
            <p className="text-xs text-[#6D6D6D] mt-0.5">for {formatDate(currentDate)}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-black/5 rounded-md transition-colors text-[#6D6D6D] hover:text-[#1B1B1B]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Team Meeting"
              className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all"
              autoFocus
            />
          </div>

          {/* Time Row */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2 flex items-center gap-2">
                  End Time
                  {crossesMidnight() && (
                    <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] rounded">
                      Next day
                    </span>
                  )}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] transition-all"
                  required
                />
              </div>
            </div>

            {/* Duration Display */}
            {startTime && endTime && startTime !== endTime && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F8F8F7] rounded-lg">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#6D6D6D]"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="text-xs text-[#6D6D6D]">
                  Duration: <span className="font-medium text-[#1B1B1B]">{calculateDuration()}</span>
                  {crossesMidnight() && (
                    <span className="ml-1 text-[#92400E]">
                      (continues to {formatDate(new Date(currentDate.getTime() + 86400000))})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Tag (Optional)
            </label>
            <TagDropdown
              value={selectedTagId}
              onChange={setSelectedTagId}
              onAddNewTag={tagCreation.openAddModal}
              isOpen={isDropdownOpen}
              onToggle={setIsDropdownOpen}
              variant="modal"
              placeholder="Select a tag"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#1B1B1B]/50 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              data-private
              className="w-full px-3 py-2 text-sm text-[#1B1B1B] bg-white border border-[#E4E2DD] rounded-lg focus:outline-none focus:border-[#3CBF6F] focus:ring-1 focus:ring-[#3CBF6F] resize-none transition-all"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="px-3 py-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg">
              <p className="text-xs text-[#DC2626]">{validationError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-[#E4E2DD] bg-white flex justify-end items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-[#1B1B1B]/70 hover:text-[#1B1B1B] transition-colors rounded-lg focus:outline-none"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#3CBF6F] text-white text-sm font-medium rounded-lg shadow-[0_1px_2px_rgba(60,191,111,0.2)] hover:bg-[#34A861] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3CBF6F]"
            disabled={isSaving}
          >
            {isSaving ? 'Adding...' : 'Add Block'}
          </button>
        </div>
      </div>

      {/* Edit Tag Modal */}
      <EditTagModal {...tagCreation.modalProps} />
    </div>
  );
}
