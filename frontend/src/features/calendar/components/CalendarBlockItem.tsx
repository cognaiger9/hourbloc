'use client';

import { useState } from 'react';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { formatTime } from '@/utils/dateUtils';

interface CalendarBlockItemProps {
  block: CalendarBlock;
  leftPercent: number;
  widthPercent: number;
  topPx: number;
  heightPx: number;
  onClick: () => void;
  isDragging?: boolean;
  isPreview?: boolean;
  isResizing?: boolean;
  isSelected?: boolean;
  resizeEdge?: 'top' | 'bottom' | null;
  onInteractionStart: (blockId: string, element: HTMLElement, clientX: number, clientY: number) => void;
  displayStartTime?: number;
  displayEndTime?: number;
  tagColor?: string; // Color from tag
}

/** Convert #rrggbb → "r, g, b" */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function CalendarBlockItem({
  block,
  leftPercent,
  widthPercent,
  topPx,
  heightPx,
  onClick: _onClick,
  isDragging = false,
  isPreview = false,
  isResizing = false,
  isSelected = false,
  resizeEdge = null,
  onInteractionStart,
  displayStartTime,
  displayEndTime,
  tagColor,
}: CalendarBlockItemProps) {
  // Use theme accent green for untagged blocks — fix the #10b981 mismatch
  const blockColor = tagColor || '#3cbf6f';
  const rgb = hexToRgb(blockColor);

  const [hoveredEdge, setHoveredEdge] = useState<'top' | 'bottom' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const formatTimeRange = () => {
    const startTime = displayStartTime !== undefined ? displayStartTime : block.startTime;
    const endTime = displayEndTime !== undefined ? displayEndTime : block.endTime;
    return `${formatTime(startTime)} – ${formatTime(endTime)}`;
  };

  // Edge detection for cursor feedback
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPreview || isResizing || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const edgeThreshold = 10;
    if (relativeY >= -2 && relativeY <= edgeThreshold) {
      setHoveredEdge('top');
    } else if (relativeY >= rect.height - edgeThreshold && relativeY <= rect.height + 2) {
      setHoveredEdge('bottom');
    } else {
      setHoveredEdge(null);
    }
  };

  const handleMouseEnter = () => {
    if (!isPreview && !isDragging && !isResizing) setIsHovered(true);
  };

  const handleMouseLeave = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (!isResizing && !isDragging) {
      setHoveredEdge(null);
      setIsHovered(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent instanceof MouseEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const edgeThreshold = 12;
    const isOnTopEdge = relativeY >= -8 && relativeY <= edgeThreshold;
    const isOnBottomEdge = relativeY >= rect.height - edgeThreshold && relativeY <= rect.height + 8;
    if (isOnTopEdge || isOnBottomEdge) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.preventDefault();
        e.nativeEvent.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    onInteractionStart(block.id, e.currentTarget as HTMLElement, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    e.preventDefault();
  };

  // Cursor logic
  const getCursor = () => {
    if (isResizing) return 'ns-resize';
    if (hoveredEdge) return 'ns-resize';
    if (isDragging) return 'grabbing';
    return 'grab';
  };

  // ── Visual states ──────────────────────────────────────────
  // Card fill: translucent tint of the tag color
  const fillOpacity = isPreview ? 0.10 : isDragging ? 0.14 : 0.13;
  const bgColor = `rgba(${rgb}, ${fillOpacity})`;

  // Left rail: full saturated color
  const railColor = blockColor;
  const railWidth = (isHovered && !isDragging && !isResizing && !isPreview) ? '4px' : '3px';

  // Outer border: very subtle same-color tint
  const borderColor = `rgba(${rgb}, ${isPreview ? 0.18 : isSelected ? 0.6 : 0.20})`;

  // Scale + lift transform
  let transform = 'none';
  if (isDragging) transform = 'scale(1.025)';
  else if (isHovered && !isResizing && !isPreview) transform = 'translateY(-1px)';

  // Box shadow
  let boxShadow = 'var(--shadow-block)';
  if (isDragging) boxShadow = 'var(--shadow-block-drag)';
  else if (isHovered && !isResizing && !isPreview) boxShadow = 'var(--shadow-block-hover)';

  // Selected ring (inner box-shadow addition)
  if (isSelected && !isDragging) {
    boxShadow = `${boxShadow}, inset 0 0 0 2px ${blockColor}`;
  }

  // Z-index
  const zIndex = isDragging || isPreview ? 30 : isResizing ? 30 : isSelected ? 25 : 20;

  // Opacity for the origin block while dragging (isPreview is the ghost)
  const opacity = isPreview ? 0.7 : 1;

  // Min height for tiny blocks (< 30min)
  const displayHeight = Math.max(heightPx - 1, 22);

  return (
    <div
      data-calendar-block={block.id}
      draggable={false}
      className="absolute pointer-events-auto select-none overflow-hidden"
      style={{
        left: `${leftPercent}%`,
        top: `${topPx}px`,
        height: `${displayHeight}px`,
        width: `calc(${widthPercent}% - 6px)`,
        marginLeft: '3px',
        zIndex,
        opacity,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        boxShadow,
        transform,
        // Only animate non-position properties so drag doesn't lag
        transition: isDragging || isResizing
          ? 'box-shadow 0.1s ease, opacity 0.1s ease'
          : 'transform 0.12s ease, box-shadow 0.15s ease, background-color 0.1s ease, border-color 0.1s ease',
        cursor: getCursor(),
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDragStart={handleDragStart}
    >
      {/* Left accent rail */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: railWidth,
          backgroundColor: railColor,
          borderRadius: '6px 0 0 6px',
          transition: 'width 0.1s ease',
        }}
      />

      {/* Content */}
      <div className="pl-3 pr-1.5 py-1.5 h-full flex flex-col justify-start gap-0.5">
        <div
          className="truncate text-xs font-semibold leading-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {block.title || '(No title)'}
        </div>
        {displayHeight > 36 && (
          <div
            className="truncate text-[10px] leading-tight"
            style={{
              color: 'var(--foreground-secondary)',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTimeRange()}
          </div>
        )}
      </div>

      {/* Resize grip indicators — visible on hover at edges */}
      {!isPreview && !isDragging && (hoveredEdge === 'top' || isResizing && resizeEdge === 'top') && (
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: `rgba(${rgb}, 0.5)`,
          }}
        />
      )}
      {!isPreview && !isDragging && (hoveredEdge === 'bottom' || isResizing && resizeEdge === 'bottom') && (
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: `rgba(${rgb}, 0.5)`,
          }}
        />
      )}
    </div>
  );
}
