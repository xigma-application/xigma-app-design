import { RefObject } from 'react';

export const handlePointerUp = (anchorIndexRef: RefObject<number | null>, isDraggingOffsetRef: RefObject<boolean>): void => {
  anchorIndexRef.current = null;
  isDraggingOffsetRef.current = false;
};
