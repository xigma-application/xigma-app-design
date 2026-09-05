import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TLineEndpointStyle, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
  endPoint: TLineEndpointStyle,
  startPoint: TLineEndpointStyle,
  stroke: string,
): void => {
  lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

  if (startRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);

    canvasRefs.draftRef.current = {
      endPoint,
      startPoint,
      stroke,
      type: NodeType.line,
      x1: Math.round(startRef.current.x),
      x2: Math.round(point.x),
      y1: Math.round(startRef.current.y),
      y2: Math.round(point.y),
    };
  }
};
