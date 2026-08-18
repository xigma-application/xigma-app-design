// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const createCanvasRefs = (overrides: Partial<TCanvasRefs> = {}): TCanvasRefs => ({
  canvasRef: { current: null },
  cornerRadiusDragRef: { current: null },
  draftRef: { current: null },
  ellipseArcDragRef: { current: null },
  ellipseArcRatioDragRef: { current: null },
  ellipseArcRotateDragRef: { current: null },
  hoverRef: { current: null },
  marqueeRef: { current: null },
  polygonCornerRadiusDragRef: { current: null },
  sliceRef: { current: null },
  starCornerRadiusDragRef: { current: null },
  ...overrides,
});
