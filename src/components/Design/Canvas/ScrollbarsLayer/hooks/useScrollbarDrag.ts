import { RefObject, useEffect, useRef } from 'react';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TFrozenAxisRange, TScrollbarAxis } from '../types';
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { clamp } from 'utils/math/clamp';
import { getScrollbarThumb } from '../utils/getScrollbarThumb';
import { getScrollGeometry } from '../utils/getScrollGeometry';

type TDragAnchor = {
  clientPos: number;
  offset: number;
  size: number;
  trackLength: number;
  viewportValue: number;
  worldPerTrackPx: number;
};

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

  const handlePointerDown = (canvas: HTMLCanvasElement, thumb: HTMLDivElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      const state = store.getState();
      const viewport = selectViewport(state);
      const { range, visibleRect } = getScrollGeometry(
        canvas.getBoundingClientRect(),
        layout.leftPanelWidthRef.current,
        layout.rightPanelWidthRef.current,
        selectOrderedNodes(state),
        viewport,
      );
      const rangeStart = axis === 'x' ? range.x : range.y;
      const rangeLength = axis === 'x' ? range.width : range.height;
      const visibleStart = axis === 'x' ? visibleRect.x : visibleRect.y;
      const trackLength = axis === 'x' ? visibleRect.width : visibleRect.height;
      const thumb0 = getScrollbarThumb(trackLength, visibleStart, trackLength, rangeStart, rangeLength);

      anchorRef.current = {
        clientPos: axis === 'x' ? event.clientX : event.clientY,
        offset: thumb0.offset,
        size: thumb0.size,
        trackLength,
        viewportValue: axis === 'x' ? viewport.x : viewport.y,
        worldPerTrackPx: rangeLength / trackLength,
      };
      frozenRangeRef.current = { rangeLength };
      draggingRef.current = true;
      thumb.setPointerCapture(event.pointerId);
      event.stopPropagation();
    }
  };

  const handlePointerMove = (event: PointerEvent): void => {
    const anchor = anchorRef.current;

    if (anchor !== null) {
      const clientPos = axis === 'x' ? event.clientX : event.clientY;
      const desiredOffset = clamp(anchor.offset + (clientPos - anchor.clientPos), 0, anchor.trackLength - anchor.size);
      const nextValue = anchor.viewportValue - (desiredOffset - anchor.offset) * anchor.worldPerTrackPx;
      const viewport = selectViewport(store.getState());

      dispatch(setViewport({ ...viewport, [axis]: nextValue }));
      event.stopPropagation();
    }
  };

  const handlePointerUp = (thumb: HTMLDivElement, event: PointerEvent): void => {
    anchorRef.current = null;
    frozenRangeRef.current = null;
    draggingRef.current = false;
    thumb.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    const thumb = thumbRef.current;
    const canvas = canvasRef.current;

    if (thumb && canvas) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, thumb, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(thumb, event);

      thumb.addEventListener('pointerdown', onPointerDown);
      thumb.addEventListener('pointermove', onPointerMove);
      thumb.addEventListener('pointerup', onPointerUp);

      return (): void => {
        thumb.removeEventListener('pointerdown', onPointerDown);
        thumb.removeEventListener('pointermove', onPointerMove);
        thumb.removeEventListener('pointerup', onPointerUp);
        anchorRef.current = null;
        frozenRangeRef.current = null;
        draggingRef.current = false;
      };
    }
  }, [axis, canvasRef, dispatch, draggingRef, frozenRangeRef, layout, thumbRef]);
};
