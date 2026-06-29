'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { type Tag } from '@/types/tag';

interface TagSelectorProps {
  selectedTag: string;
  tags: Tag[];
  isLoading: boolean;
  onTagSelect: (tagName: string) => void;
  onManageTags: () => void;
}

export default function TagSelector({
  selectedTag,
  tags,
  isLoading,
  onTagSelect,
  onManageTags,
}: TagSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative flex items-center justify-center gap-3 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full px-4 py-2 min-w-[200px] cursor-pointer transition-colors hover:bg-white/60"
        >
          <div className="flex items-center gap-2.5">
            {selectedTag && (() => {
              const selectedTagObj = tags.find(t => t.name === selectedTag);
              return selectedTagObj ? (
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: selectedTagObj.color }}
                ></div>
              ) : null;
            })()}
            <span className="text-sm font-medium text-[#374151]">{selectedTag || 'Select tag'}</span>
          </div>
          {/* Icon: Arrow Down */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 flex-shrink-0">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Content
        align="center"
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] bg-white border border-black/5 rounded-xl shadow-lg overflow-hidden z-50"
      >
        {isLoading ? (
          <div className="px-4 py-2.5 text-sm text-[#9CA3AF] text-center">
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="px-4 py-2.5 text-sm text-[#9CA3AF] text-center">
            No tags yet
          </div>
        ) : (
          tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => {
                onTagSelect(tag.name);
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/[0.03] flex items-center gap-2.5 ${
                selectedTag === tag.name ? 'bg-green-light text-accent-green' : 'text-[#374151]'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: tag.color }}
              ></div>
              <span>{tag.name}</span>
            </button>
          ))
        )}
        {/* Divider */}
        <div className="border-t border-black/5 my-1"></div>
        {/* Manage Tags Option */}
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            onManageTags();
          }}
          className="w-full text-left px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-black/[0.03] flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Manage Tags
        </button>
      </Popover.Content>
    </Popover.Root>
  );
}

