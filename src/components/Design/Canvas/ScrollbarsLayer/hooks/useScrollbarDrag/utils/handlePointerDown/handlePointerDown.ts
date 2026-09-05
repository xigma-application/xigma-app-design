import { RefObject } from 'react';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TDragAnchor } from '../../types';
import { TFrozenAxisRange, TScrollbarAxis } from '../../../../types';
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { getScrollbarThumb } from '../../../../utils/getScrollbarThumb';
import { getScrollGeometry } from '../../../../utils/getScrollGeometry';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  thumb: HTMLDivElement,
  event: PointerEvent,
  axis: TScrollbarAxis,
  layout: TLayoutRefs,
  frozenRangeRef: RefObject<TFrozenAxisRange>,
  draggingRef: RefObject<boolean>,
  anchorRef: RefObject<TDragAnchor | null>,
): void => {
  if (event.button === MouseButton.primary) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const { range, visibleRect } = getScrollGeometry(canvas.getBoundingClientRect(), layout, selectOrderedNodes(state), viewport);
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
