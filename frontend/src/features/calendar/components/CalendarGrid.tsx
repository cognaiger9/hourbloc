'use client';

import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/utils/common';
import { isSameDay } from '@/utils/dateUtils';
import { formatTime } from '@/utils/dateUtils';
import CalendarBlockItem from './CalendarBlockItem';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { type Tag } from '@/types/tag';
import { type TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { type CalendarBlock } from '@/features/calendar/types/calendarBlock';

interface CalendarGridProps {
  dates: Date[];
  blocks: CalendarBlock[];
  viewMode: 'week' | 'day';
  onGridClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (scrollTop: number) => void;
  scrollTop?: number;
  onBlockInteractionStart: (blockId: string, element: HTMLElement, clientX: number, clientY: number) => void;
  tags?: Tag[];
  onTaskDrop?: (task: TaskBlueprint, targetTime: number) => void;
  draggedTaskId?: string | null;
}

const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(
  (
    {
      dates,
      blocks,
      viewMode,
      onGridClick,
      gridContainerRef,
      onScroll,
      scrollTop,
      onBlockInteractionStart,
      tags = [],
      onTaskDrop,
      draggedTaskId,
    },
    gridColumnsRef
  ) => {
    const activeBlockId = useCalendarStore((state) => state.activeBlockId);
    const dragPreview = useCalendarStore((state) => state.dragPreview);
    const resizePreview = useCalendarStore((state) => state.resizePreview);
    const resizeEdge = useCalendarStore((state) => state.resizeEdge);
    const interactionState = useCalendarStore((state) => state.interactionState);
    const selectedBlockId = useCalendarStore((state) => state.selectedBlockId);

    const [dragOverHour, setDragOverHour] = useState<number | null>(null);
    const [hoveredHour, setHoveredHour] = useState<number | null>(null);

    // Suppress slot hover while dragging/resizing
    const isInteracting = interactionState === 'dragging' || interactionState === 'resizing';

    // Sync scroll position if controlled
    useEffect(() => {
      if (scrollTop !== undefined && gridColumnsRef && 'current' in gridColumnsRef && gridColumnsRef.current) {
        gridColumnsRef.current.scrollTop = scrollTop;
      }
    }, [scrollTop, gridColumnsRef]);

    const handleScroll = () => {
      if (gridColumnsRef && 'current' in gridColumnsRef && gridColumnsRef.current) {
        onScroll(gridColumnsRef.current.scrollTop);
      }
    };

    // Slot hover tracking
    const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteracting) {
        setHoveredHour(null);
        return;
      }
      const rect = gridContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scrollT = gridColumnsRef && 'current' in gridColumnsRef && gridColumnsRef.current
        ? gridColumnsRef.current.scrollTop : 0;
      const y = e.clientY - rect.top + scrollT;
      const hour = Math.floor(y / 60);
      setHoveredHour(Math.max(0, Math.min(23, hour)));
    };

    const handleGridMouseLeave = () => setHoveredHour(null);

    // Task drag-over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!onTaskDrop || !draggedTaskId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      const rect = gridContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scrollT = gridColumnsRef && 'current' in gridColumnsRef && gridColumnsRef.current
        ? gridColumnsRef.current.scrollTop : 0;
      const y = e.clientY - rect.top + scrollT;
      setDragOverHour(Math.max(0, Math.min(23, Math.floor(y / 60))));
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      if (e.currentTarget === e.target) setDragOverHour(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (!onTaskDrop) return;
      e.preventDefault();
      try {
        const taskData = e.dataTransfer.getData('application/json');
        if (!taskData) return;
        const task: TaskBlueprint = JSON.parse(taskData);
        const rect = gridContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scrollT = gridColumnsRef && 'current' in gridColumnsRef && gridColumnsRef.current
          ? gridColumnsRef.current.scrollTop : 0;
        const y = e.clientY - rect.top + scrollT;
        onTaskDrop(task, Math.max(0, Math.min(23, Math.floor(y / 60))));
      } catch (error) {
        console.error('Error handling task drop:', error);
      } finally {
        setDragOverHour(null);
      }
    };

    // Derive drag-preview time tooltip text
    const getTimeTooltip = (): string | null => {
      if (interactionState === 'dragging' && dragPreview && activeBlockId) {
        const draggedBlock = blocks.find((b) => b.id === activeBlockId);
        if (!draggedBlock) return null;
        const dur = draggedBlock.endTime - draggedBlock.startTime;
        return `${formatTime(dragPreview.hour)} – ${formatTime(dragPreview.hour + dur)}`;
      }
      if (interactionState === 'resizing' && resizePreview) {
        return `${formatTime(resizePreview.startTime)} – ${formatTime(resizePreview.endTime)}`;
      }
      return null;
    };

    // Position for time tooltip (follows drag/resize preview)
    const getTooltipTop = (): number | null => {
      if (interactionState === 'dragging' && dragPreview) {
        return dragPreview.hour * 60;
      }
      if (interactionState === 'resizing' && resizePreview && resizeEdge) {
        return resizeEdge === 'bottom' ? resizePreview.endTime * 60 : resizePreview.startTime * 60;
      }
      return null;
    };

    const tooltipText = getTimeTooltip();
    const tooltipTop = getTooltipTop();

    const today = new Date();

    const safeBlocks = Array.isArray(blocks) ? blocks : [];
    const visibleBlocks = safeBlocks.filter((block) =>
      dates.some((date) => isSameDay(block.date, date))
    );

    return (
      <div className="flex-1 min-w-0 relative bg-surface">
        <div
          ref={gridColumnsRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
        >
          <div
            ref={gridContainerRef}
            className="flex relative bg-surface w-full cursor-pointer"
            style={{ height: '1440px' }}
            onClick={onGridClick}
            onMouseMove={handleGridMouseMove}
            onMouseLeave={handleGridMouseLeave}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Today column tint (week view only) */}
            {viewMode === 'week' && dates.map((date, index) => {
              if (!isSameDay(date, today)) return null;
              const leftPercent = (index / dates.length) * 100;
              const widthPercent = 100 / dates.length;
              return (
                <div
                  key={`today-col-${index}`}
                  className="absolute inset-y-0 pointer-events-none"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: 'rgba(60, 191, 111, 0.04)',
                    zIndex: 0,
                  }}
                />
              );
            })}

            {/* Background grid lines — solid hour + dashed half-hour */}
            <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 1 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-[60px] relative flex-shrink-0">
                  {/* Solid hour line */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  />
                  {/* Dashed half-hour line */}
                  <div
                    className="absolute left-0 right-0"
                    style={{
                      top: '50%',
                      borderTop: '1px dashed rgba(228, 226, 221, 0.55)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Vertical day column separators */}
            <div className="absolute inset-0 flex w-full pointer-events-none" style={{ zIndex: 1 }}>
              {dates.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex-1 border-r border-border min-w-0',
                    viewMode === 'day' && 'border-r-0',
                    index === dates.length - 1 && 'border-r-0'
                  )}
                />
              ))}
            </div>

            {/* Slot hover band (suppressed while interacting) */}
            {hoveredHour !== null && !isInteracting && !draggedTaskId && (
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${hoveredHour * 60}px`,
                  height: '60px',
                  backgroundColor: 'rgba(60, 191, 111, 0.05)',
                  zIndex: 2,
                  borderTop: '1px solid rgba(60, 191, 111, 0.15)',
                  borderBottom: '1px solid rgba(60, 191, 111, 0.15)',
                }}
              />
            )}

            {/* Current time indicator */}
            <CurrentTimeIndicator dates={dates} totalDates={dates.length} />

            {/* Calendar Blocks */}
            {visibleBlocks.map((block) => {
              const blockDateIndex = dates.findIndex((date) => isSameDay(block.date, date));
              if (blockDateIndex === -1) return null;

              const isDragging = activeBlockId === block.id && dragPreview !== null;
              const isResizing = activeBlockId === block.id && resizePreview !== null;
              const isSelected = selectedBlockId === block.id;

              const displayStartTime = isResizing && resizePreview ? resizePreview.startTime : block.startTime;
              const displayEndTime = isResizing && resizePreview ? resizePreview.endTime : block.endTime;

              const leftPercent = (blockDateIndex / dates.length) * 100;
              const widthPercent = 100 / dates.length;
              const topPx = displayStartTime * 60;
              const heightPx = (displayEndTime - displayStartTime) * 60;

              const blockTag = tags.find(t => t.name === block.tag);
              const tagColor = blockTag?.color;

              return (
                <CalendarBlockItem
                  key={block.id}
                  block={block}
                  leftPercent={leftPercent}
                  widthPercent={widthPercent}
                  topPx={topPx}
                  heightPx={heightPx}
                  onClick={() => {}}
                  isDragging={isDragging}
                  isResizing={isResizing}
                  isSelected={isSelected}
                  resizeEdge={isResizing ? resizeEdge : null}
                  onInteractionStart={onBlockInteractionStart}
                  displayStartTime={displayStartTime}
                  displayEndTime={displayEndTime}
                  tagColor={tagColor}
                />
              );
            })}

            {/* Drag Preview ghost */}
            {dragPreview && activeBlockId && (
              (() => {
                const draggedBlock = blocks.find((b) => b.id === activeBlockId);
                if (!draggedBlock) return null;
                const leftPercent = (dragPreview.dayIndex / dates.length) * 100;
                const widthPercent = 100 / dates.length;
                const dragPreviewStart = dragPreview.hour;
                const dragPreviewEnd = dragPreview.hour + (draggedBlock.endTime - draggedBlock.startTime);
                const topPx = dragPreviewStart * 60;
                const heightPx = (dragPreviewEnd - dragPreviewStart) * 60;
                const dragPreviewTag = tags.find(t => t.name === draggedBlock.tag);
                return (
                  <CalendarBlockItem
                    key={`drag-preview-${activeBlockId}`}
                    block={draggedBlock}
                    leftPercent={leftPercent}
                    widthPercent={widthPercent}
                    topPx={topPx}
                    heightPx={heightPx}
                    onClick={() => {}}
                    isDragging={false}
                    isPreview={true}
                    isResizing={false}
                    isSelected={false}
                    resizeEdge={null}
                    onInteractionStart={() => {}}
                    displayStartTime={dragPreviewStart}
                    displayEndTime={dragPreviewEnd}
                    tagColor={dragPreviewTag?.color}
                  />
                );
              })()
            )}

            {/* Time tooltip during drag/resize */}
            {tooltipText !== null && tooltipTop !== null && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: `${tooltipTop - 12}px`,
                  right: '8px',
                  zIndex: 50,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--foreground)',
                    color: '#fff',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                    lineHeight: 1,
                    padding: '3px 7px',
                    borderRadius: '5px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                >
                  {tooltipText}
                </span>
              </div>
            )}

            {/* Task Drop Zone Highlight */}
            {draggedTaskId && dragOverHour !== null && (
              <div
                className="absolute left-0 right-0 pointer-events-none rounded-md z-10"
                style={{
                  top: `${dragOverHour * 60}px`,
                  height: '60px',
                  border: '2px dashed var(--accent-green)',
                  backgroundColor: 'rgba(60, 191, 111, 0.10)',
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

CalendarGrid.displayName = 'CalendarGrid';

export default CalendarGrid;
