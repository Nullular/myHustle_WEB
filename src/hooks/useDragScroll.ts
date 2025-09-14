import { useRef, useState, useCallback } from 'react';

// Simple drag-to-scroll for horizontal containers (works with mouse and touch)
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [dragging, setDragging] = useState(false);
  const pos = useRef({ startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setDragging(true);
    // Prevent image/text drag selection
    e.preventDefault();
    pos.current.startX = e.pageX - ref.current.offsetLeft;
    pos.current.scrollLeft = ref.current.scrollLeft;
  }, []);

  const endDrag = useCallback(() => {
    setDragging(false);
  }, []);

  const onMouseLeave = endDrag;
  const onMouseUp = endDrag;

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - pos.current.startX; // positive means moving right
    ref.current.scrollLeft = pos.current.scrollLeft - walk;
  }, [dragging]);

  // Touch support
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!ref.current) return;
    setDragging(true);
    const touch = e.touches[0];
    pos.current.startX = touch.pageX - ref.current.offsetLeft;
    pos.current.scrollLeft = ref.current.scrollLeft;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !ref.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - ref.current.offsetLeft;
    const walk = x - pos.current.startX;
    ref.current.scrollLeft = pos.current.scrollLeft - walk;
  }, [dragging]);

  const onTouchEnd = endDrag;

  return {
    ref,
    dragging,
    handlers: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  } as const;
}

export default useDragScroll;
