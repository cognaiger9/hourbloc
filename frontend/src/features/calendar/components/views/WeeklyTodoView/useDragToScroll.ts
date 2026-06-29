'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface UseDragToScrollReturn {
  containerRef: React.RefObject<HTMLElement | null>;
  cursorClass: string;
}

/**
 * Custom hook for drag-to-scroll functionality
 * Allows users to click and drag to scroll horizontally (weekly to do list view)
 */
export function useDragToScroll(): UseDragToScrollReturn {
  const containerRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorClass, setCursorClass] = useState('cursor-grab');

  const startPosRef = useRef<{ x: number; scrollLeft: number } | null>(null);
  const isDraggingRef = useRef(false);
  const isPendingRef = useRef(false);

  const DRAG_THRESHOLD = 5; // pixels - must move this much before dragging starts

  // Check if element is interactive (button, link, input, etc.)
  const isInteractiveElement = useCallback((element: HTMLElement | null): boolean => {
    if (!element) return false;

    // Check if element or its parent is interactive
    const tagName = element.tagName.toLowerCase();
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];

    if (interactiveTags.includes(tagName)) {
      return true;
    }

    // Check if element has click handlers or is within a clickable area
    if (element.closest('button, a, [role="button"], [onclick]')) {
      return true;
    }

    // Check if element has pointer-events: none (should not be draggable)
    const style = window.getComputedStyle(element);
    if (style.pointerEvents === 'none') {
      return false;
    }

    return false;
  }, []);

  // Check if content overflows
  const hasOverflow = useCallback((): boolean => {
    const container = containerRef.current;
    if (!container) return false;
    return container.scrollWidth > container.clientWidth;
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Don't start drag if content doesn't overflow
    if (!hasOverflow()) return;

    // Don't start drag on interactive elements
    const target = e.target as HTMLElement;
    if (isInteractiveElement(target)) {
      return;
    }

    // Check if clicking on a clickable element (like task cards with cursor-pointer)
    // Allow these clicks to go through
    const clickableParent = target.closest('[class*="cursor-pointer"], [onclick]');
    if (clickableParent && clickableParent !== container) {
      return;
    }

    startPosRef.current = {
      x: e.clientX,
      scrollLeft: container.scrollLeft,
    };

    isPendingRef.current = true;
    // Don't prevent default yet - allow clicks to work
  }, [hasOverflow, isInteractiveElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!startPosRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    // Check if we should transition from pending to dragging
    if (isPendingRef.current && !isDraggingRef.current) {
      const distance = Math.abs(e.clientX - startPosRef.current.x);
      if (distance > DRAG_THRESHOLD) {
        // Start dragging
        isDraggingRef.current = true;
        isPendingRef.current = false;
        setIsDragging(true);
        setCursorClass('cursor-grabbing');

        // Prevent text selection during drag
        container.style.userSelect = 'none';
        container.style.cursor = 'grabbing';
      } else {
        // Still pending, don't scroll yet
        return;
      }
    }

    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startPosRef.current.x;
    container.scrollLeft = startPosRef.current.scrollLeft - deltaX;
  }, []);

  const handleMouseUp = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // If we were only pending (didn't drag), allow the click to go through
    if (isPendingRef.current && !isDraggingRef.current) {
      isPendingRef.current = false;
      startPosRef.current = null;
      return;
    }

    isDraggingRef.current = false;
    isPendingRef.current = false;
    setIsDragging(false);
    setCursorClass('cursor-grab');
    startPosRef.current = null;

    // Restore text selection
    container.style.userSelect = '';
    container.style.cursor = '';
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Stop dragging if mouse leaves the container
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  // Update cursor based on hover state and overflow
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCursor = () => {
      if (hasOverflow() && !isDragging) {
        setCursorClass('cursor-grab');
      } else if (!hasOverflow()) {
        setCursorClass('');
      }
    };

    updateCursor();

    // Update cursor on resize
    const resizeObserver = new ResizeObserver(updateCursor);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [hasOverflow, isDragging]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);

  return {
    containerRef,
    cursorClass,
  };
}
