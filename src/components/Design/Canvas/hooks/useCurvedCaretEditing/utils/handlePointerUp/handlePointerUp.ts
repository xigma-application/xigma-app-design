import { RefObject } from 'react';

export const handlePointerUp = (
  anchorIndexRef: RefObject<number | null>,
  isDraggingOffsetRef: RefObject<boolean>,
  setClassName: (className: string | null) => void,
): void => {
  if (isDraggingOffsetRef.current) {
    setClassName('hand');
  }

  anchorIndexRef.current = null;
  isDraggingOffsetRef.current = false;
};
