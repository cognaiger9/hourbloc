'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ReviewBlock } from '../types';

interface BlockEditorProps {
  block: ReviewBlock;
  tags: Array<{ id: string; name: string }>;
  onSave: (blockId: string, updatedBlock: Partial<ReviewBlock>) => void;
  onCancel: () => void;
}

export default function BlockEditor({ block, tags, onSave, onCancel }: BlockEditorProps) {
  const [title, setTitle] = useState(block.title);
  const [selectedTagId, setSelectedTagId] = useState(block.tagId || '');
  const [description, setDescription] = useState(block.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTag = tags.find(t => t.id === selectedTagId);
    onSave(block.id, {
      title,
      tagId: selectedTagId || null,
      category: selectedTag?.name || 'Other',
      description: description || undefined,
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.02),0_0_0_1px_rgba(228,226,221,1)] p-5 pb-9 sm:p-[20px] sm:pb-[36px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Title Field */}
          <div className="flex-1 flex flex-col gap-[6px]">
            <label className="text-[11px] font-medium uppercase tracking-[0.275px] text-[#6D6D6D] leading-[1.5]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAFAF9] text-[#1B1B1B] text-sm font-normal border border-[#E4E2DD] rounded-md px-3 py-2 outline-none transition-all placeholder-gray-400 h-9 focus:border-[#3CBF6F] focus:shadow-[0_0_0_1px_rgba(60,191,111,0.2)]"
              placeholder="Enter title"
            />
          </div>

          {/* Category Field */}
          <div className="w-full sm:w-[220px] flex flex-col gap-[6px]">
            <label className="text-[11px] font-medium uppercase tracking-[0.275px] text-[#6D6D6D] leading-[1.5]">
              Tag
            </label>
            <div className="relative">
              <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                className="w-full bg-[#FAFAF9] text-[#1B1B1B] text-sm font-normal border border-[#E4E2DD] rounded-md pl-3 pr-8 py-2 outline-none transition-all appearance-none cursor-pointer h-9 focus:border-[#3CBF6F] focus:shadow-[0_0_0_1px_rgba(60,191,111,0.2)]"
              >
                <option value="">No category</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                <ChevronDown width={14} height={14} className="text-[#6D6D6D]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11px] font-medium uppercase tracking-[0.275px] text-[#6D6D6D] leading-[1.5]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-private
            className="w-full bg-[#FAFAF9] text-[#1B1B1B] text-sm font-normal border border-[#E4E2DD] rounded-md px-3 py-2 outline-none transition-all placeholder-gray-400 min-h-[64px] resize-none leading-[1.625] focus:border-[#3CBF6F] focus:shadow-[0_0_0_1px_rgba(60,191,111,0.2)]"
            rows={2}
            placeholder="Enter description"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-1">
          <div className="pt-2 flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 h-8 rounded-md text-xs font-medium text-[#6D6D6D] hover:text-[#1B1B1B] hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 h-8 rounded-md text-xs font-medium text-white bg-[#3CBF6F] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#34a861] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </article>
  );
}

