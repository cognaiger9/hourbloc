'use client';

import { memo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ReviewBlock } from '../types';

interface BlockItemProps {
  block: ReviewBlock;
  onEdit: (block: ReviewBlock) => void;
  onDelete: (block: ReviewBlock) => void;
}

export default memo(function BlockItem({ block, onEdit, onDelete }: BlockItemProps) {
  return (
    <article className="group bg-surface rounded-lg border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 transition-all hover:shadow-md hover:border-black/10">
      <div className="flex flex-col gap-1">
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-medium text-foreground">{block.title}</h2>
            <span
              className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium leading-tight tracking-wide border"
              style={{
                backgroundColor: block.categoryBg,
                color: block.categoryColor,
                borderColor: `${block.categoryBorder}/50`,
              }}
            >
              {block.category}
            </span>
          </div>

          {/* Hover Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(block)}
              className="w-7 h-7 flex items-center justify-center rounded text-foreground-secondary hover:text-foreground hover:bg-black/5 transition-colors"
              aria-label="Edit"
            >
              <Pencil width={14} height={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete(block)}
              className="w-7 h-7 flex items-center justify-center rounded text-foreground-secondary hover:text-danger hover:bg-red-50 transition-colors"
              aria-label="Delete"
            >
              <Trash2 width={14} height={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Description */}
        {block.description && (
          <p className="text-sm text-foreground-secondary font-normal leading-relaxed max-w-3xl mt-1">
            {block.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-foreground-secondary font-normal">{block.duration}</span>
          <span className="text-[10px] text-[#E4E2DD]">•</span>
          <span className="text-xs text-foreground-secondary font-normal">{block.timeRange}</span>
        </div>
      </div>
    </article>
  );
});
