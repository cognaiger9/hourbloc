'use client';

import { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/common';
import { useTagsQuery } from '@/hooks/useTags';

interface TagDropdownProps {
  /**
   * Currently selected tag ID
   */
  value: string | null;

  /**
   * Callback when tag is selected
   */
  onChange: (tagId: string) => void;

  /**
   * Callback when "Add Tag" is clicked
   */
  onAddNewTag: () => void;

  /**
   * Whether dropdown is open
   */
  isOpen: boolean;

  /**
   * Callback to toggle dropdown
   */
  onToggle: (open: boolean) => void;

  /**
   * Optional placeholder text
   */
  placeholder?: string;

  /**
   * Optional className for customization
   */
  className?: string;

  /**
   * Variant for different styling contexts
   */
  variant?: 'default' | 'modal';
}

export function TagDropdown({
  value,
  onChange,
  onAddNewTag,
  isOpen,
  onToggle,
  placeholder = 'Select a tag',
  className,
  variant = 'default',
}: TagDropdownProps) {
  const { data: tags = [] } = useTagsQuery();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedTag = tags.find((t) => t.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const baseStyles = variant === 'modal'
    ? 'bg-white border-[#E4E2DD] hover:bg-[#FAFAF9] text-[#1B1B1B]'
    : 'bg-background border-border hover:bg-surface text-foreground';

  const dropdownStyles = variant === 'modal'
    ? 'bg-white border-[#E4E2DD]'
    : 'bg-surface border-border';

  const itemStyles = variant === 'modal'
    ? {
        default: 'text-[#1B1B1B] hover:bg-[#FAFAF9]',
        selected: 'bg-[#E8F5E9] text-[#3CBF6F]',
        addButton: 'text-[#6D6D6D] hover:bg-[#FAFAF9]',
      }
    : {
        default: 'text-foreground hover:bg-background',
        selected: 'bg-green-light text-accent-green',
        addButton: 'text-foreground-secondary hover:bg-background',
      };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 border rounded-lg transition-colors text-left',
          baseStyles
        )}
        type="button"
      >
        {selectedTag ? (
          <>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedTag.color }}
            ></div>
            <span className="text-sm font-medium flex-1">{selectedTag.name}</span>
          </>
        ) : (
          <span className={cn(
            'text-sm font-medium flex-1',
            variant === 'modal' ? 'text-[#6D6D6D]' : 'text-foreground-secondary'
          )}>
            {tags.length === 0 ? 'No tags available' : placeholder}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'transition-transform',
            variant === 'modal' ? 'text-[#6D6D6D]' : 'text-foreground-secondary',
            isOpen && 'rotate-180'
          )}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg overflow-hidden z-50',
          dropdownStyles
        )}>
          {tags.length > 0 ? (
            <>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    onChange(tag.id);
                    onToggle(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2',
                    value === tag.id
                      ? itemStyles.selected
                      : itemStyles.default
                  )}
                  type="button"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  {tag.name}
                </button>
              ))}
              <div className={cn('border-t', variant === 'modal' ? 'border-[#E4E2DD]' : 'border-border')}>
                <button
                  onClick={() => {
                    onAddNewTag();
                    onToggle(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors',
                    itemStyles.addButton
                  )}
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  onAddNewTag();
                  onToggle(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors rounded-lg',
                  itemStyles.addButton
                )}
                type="button"
              >
                <Plus className="w-4 h-4" />
                Create your first tag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
