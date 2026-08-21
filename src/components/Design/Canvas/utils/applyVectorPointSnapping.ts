// others
import { VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getAllVectorVertexPositions } from './getAllVectorVertexPositions';
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getVectorAlignmentGuide } from 'utils/canvas/vectorNetwork/getVectorAlignmentGuide';

export type TVectorAlignmentAxisGuide = {
  anchor: TPoint;
  match: TPoint;
};

export type TVectorAlignmentGuide = {
  horizontal: TVectorAlignmentAxisGuide | null;
  vertical: TVectorAlignmentAxisGuide | null;
};

export type TVectorPointSnapResult = {
  guide: TVectorAlignmentGuide | null;
  isAngleSnapped: boolean;
  point: TPoint;
};

export const applyVectorPointSnapping = (
  from: TPoint,
  rawPoint: TPoint,
  zoom: number,
  isShiftPressed: boolean,
  nodes: Record<string, TSceneNode>,
  excludeVertexId: string | null = null,
): TVectorPointSnapResult => {
  const { isSnapped: isAngleSnapped, point: angleSnappedPoint } = getAngleSnappedVectorPoint(from, rawPoint, zoom, isShiftPressed);
  const candidates = getAllVectorVertexPositions(nodes, excludeVertexId ? [excludeVertexId] : []);
  const alignmentTolerance = VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / zoom;
  const alignmentGuide = getVectorAlignmentGuide(rawPoint, candidates, alignmentTolerance);

  const point: TPoint = {
    x: alignmentGuide.vertical ? alignmentGuide.point.x : angleSnappedPoint.x,
    y: alignmentGuide.horizontal ? alignmentGuide.point.y : angleSnappedPoint.y,
  };

  const guide: TVectorAlignmentGuide | null =
    alignmentGuide.vertical || alignmentGuide.horizontal
      ? {
          horizontal: alignmentGuide.horizontal ? { anchor: point, match: alignmentGuide.horizontal } : null,
          vertical: alignmentGuide.vertical ? { anchor: point, match: alignmentGuide.vertical } : null,
        }
      : null;

  return { guide, isAngleSnapped, point };
};
