import { RefObject, useEffect, useRef } from 'react';

// store
import { useAppDispatch } from 'store';

// types
import { TDragAnchor } from './types';
import { TFrozenAxisRange, TScrollbarAxis } from '../../types';
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useScrollbarDrag = (
  axis: TScrollbarAxis,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  thumbRef: RefObject<HTMLDivElement | null>,
  draggingRef: RefObject<boolean>,
  frozenRangeRef: RefObject<TFrozenAxisRange>,
): void => {
  const dispatch = useAppDispatch();
  const anchorRef = useRef<TDragAnchor | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, thumb: HTMLDivElement, event: PointerEvent): void =>
    handlePointerDown(canvas, thumb, event, axis, layout, frozenRangeRef, draggingRef, anchorRef);

  const onPointerMove = (event: PointerEvent): void => handlePointerMove(event, axis, dispatch, anchorRef);

  const onPointerUp = (thumb: HTMLDivElement, event: PointerEvent): void =>
    handlePointerUp(thumb, event, frozenRangeRef, draggingRef, anchorRef);

  useEffect(() => {
    const thumb = thumbRef.current;
    const canvas = canvasRef.current;

    if (thumb && canvas) {
      const onPointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, thumb, event);
      const onPointerMoveListener = (event: PointerEvent): void => onPointerMove(event);
      const onPointerUpListener = (event: PointerEvent): void => onPointerUp(thumb, event);

      thumb.addEventListener('pointerdown', onPointerDownListener);
      thumb.addEventListener('pointermove', onPointerMoveListener);
      thumb.addEventListener('pointerup', onPointerUpListener);

      return (): void => {
        thumb.removeEventListener('pointerdown', onPointerDownListener);
        thumb.removeEventListener('pointermove', onPointerMoveListener);
        thumb.removeEventListener('pointerup', onPointerUpListener);
        anchorRef.current = null;
        frozenRangeRef.current = null;
        draggingRef.current = false;
      };
    }
  }, [axis, canvasRef, dispatch, draggingRef, frozenRangeRef, layout, thumbRef]);
};
