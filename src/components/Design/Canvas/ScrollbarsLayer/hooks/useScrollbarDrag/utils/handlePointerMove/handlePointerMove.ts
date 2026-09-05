import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TDragAnchor } from '../../types';
import { TScrollbarAxis } from '../../../../types';

// utils
import { clamp } from 'utils/math/clamp';

export const handlePointerMove = (
  event: PointerEvent,
  axis: TScrollbarAxis,
  dispatch: AppDispatch,
  anchorRef: RefObject<TDragAnchor | null>,
): void => {
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
