// types
import { TLineNode } from 'types/design/types';

// utils
import { getPolylineSegmentOffset } from 'utils/canvas/vectorNetwork/getPolylineSegmentOffset';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getLineStrokeOutlineLoops = (node: TLineNode, halfWidth: number): TStrokeOutlineLoops | null => {
  const start = { x: node.x1, y: node.y1 };
  const end = { x: node.x2, y: node.y2 };
  const offset = getPolylineSegmentOffset(start, end, halfWidth);

  return offset
    ? {
        inner: null,
        outer: [
          { x: start.x + offset.x, y: start.y + offset.y },
          { x: end.x + offset.x, y: end.y + offset.y },
          { x: end.x - offset.x, y: end.y - offset.y },
          { x: start.x - offset.x, y: start.y - offset.y },
        ],
      }
    : null;
};
