import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
): void => {
  lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

  if (startRef.current && nodeIdRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);

    dispatch(updateNode({ changes: { x2: Math.round(point.x), y2: Math.round(point.y) }, id: nodeIdRef.current }));
  }
};
