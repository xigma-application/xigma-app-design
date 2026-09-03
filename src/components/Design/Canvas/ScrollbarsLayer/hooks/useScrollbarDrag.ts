import { RefObject, useEffect, useRef } from 'react';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TLayoutRefs } from 'types/design/canvas/types';
import { TScrollbarAxis } from '../types';

// utils
import { applyPan } from '../../hooks/useCanvasPanZoom/utils/applyPan';
import { getScrollGeometry } from '../utils/getScrollGeometry';

export const useScrollbarDrag = (
  axis: TScrollbarAxis,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  thumbRef: RefObject<HTMLDivElement | null>,
  draggingRef: RefObject<boolean>,
): void => {
  const dispatch = useAppDispatch();
  const lastClientPosRef = useRef<number | null>(null);

  const handlePointerDown = (thumb: HTMLDivElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      lastClientPosRef.current = axis === 'x' ? event.clientX : event.clientY;
      draggingRef.current = true;
      thumb.setPointerCapture(event.pointerId);
      event.stopPropagation();
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (lastClientPosRef.current !== null) {
      const clientPos = axis === 'x' ? event.clientX : event.clientY;
      const state = store.getState();
      const viewport = selectViewport(state);
      const { range, visibleRect } = getScrollGeometry(
        canvas.getBoundingClientRect(),
        layout.leftPanelWidthRef.current,
        layout.rightPanelWidthRef.current,
        selectOrderedNodes(state),
        viewport,
      );
      const trackLength = axis === 'x' ? visibleRect.width : visibleRect.height;
      const rangeLength = axis === 'x' ? range.width : range.height;
      const deltaScreenPx = (clientPos - lastClientPosRef.current) * (rangeLength / trackLength);

      dispatch(setViewport(axis === 'x' ? applyPan(viewport, deltaScreenPx, 0) : applyPan(viewport, 0, deltaScreenPx)));
      lastClientPosRef.current = clientPos;
      event.stopPropagation();
    }
  };

  const handlePointerUp = (thumb: HTMLDivElement, event: PointerEvent): void => {
    lastClientPosRef.current = null;
    draggingRef.current = false;
    thumb.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    const thumb = thumbRef.current;
    const canvas = canvasRef.current;

    if (thumb && canvas) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(thumb, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(thumb, event);

      thumb.addEventListener('pointerdown', onPointerDown);
      thumb.addEventListener('pointermove', onPointerMove);
      thumb.addEventListener('pointerup', onPointerUp);

      return (): void => {
        thumb.removeEventListener('pointerdown', onPointerDown);
        thumb.removeEventListener('pointermove', onPointerMove);
        thumb.removeEventListener('pointerup', onPointerUp);
        lastClientPosRef.current = null;
        draggingRef.current = false;
      };
    }
  }, [axis, canvasRef, dispatch, draggingRef, layout, thumbRef]);
};
