import { RefObject, useRef } from 'react';

export type TUseTrackIsDraggingResult = {
  handleDragEnd: TFunc;
  handleDragStart: TFunc;
  isDraggingRef: RefObject<boolean>;
};

export const useTrackIsDragging = (onDragStart?: TFunc, onDragEnd?: TFunc): TUseTrackIsDraggingResult => {
  const isDraggingRef = useRef(false);

  const handleDragStart = (): void => {
    isDraggingRef.current = true;
    onDragStart?.();
  };

  const handleDragEnd = (): void => {
    isDraggingRef.current = false;
    onDragEnd?.();
  };

  return { handleDragEnd, handleDragStart, isDraggingRef };
};
