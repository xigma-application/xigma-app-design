// types
import { TVectorWidthPointHover } from 'types/design/canvas/types';

export const isVectorWidthPointHovered = (
  hoveredWidthPoint: TVectorWidthPointHover | null,
  nodeId: string,
  segmentId: string,
  t: number,
): boolean =>
  hoveredWidthPoint !== null &&
  hoveredWidthPoint.nodeId === nodeId &&
  hoveredWidthPoint.segmentId === segmentId &&
  hoveredWidthPoint.t === t;
