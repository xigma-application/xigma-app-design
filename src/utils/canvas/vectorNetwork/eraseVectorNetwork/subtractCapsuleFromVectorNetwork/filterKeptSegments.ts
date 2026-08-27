// types
import { TOriginalFillPolygon } from './getOriginalFillPolygons';
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

// utils
import { getSegmentMidpoint } from '../../getSegmentMidpoint';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export type TKeptSegmentsResult = {
  droppedOriginalPiece: boolean;
  keptCapsulePiece: boolean;
  keptSegments: Record<string, TVectorSegment>;
};

export const filterKeptSegments = (
  planar: TPlanarVectorNetwork,
  capsuleSegmentIds: Set<string>,
  capsulePolygon: TPoint[],
  originalFillPolygons: TOriginalFillPolygon[],
): TKeptSegmentsResult => {
  let droppedOriginalPiece = false;
  let keptCapsulePiece = false;

  const keptSegments = Object.fromEntries(
    Object.entries(planar.segments).filter(([id, segment]) => {
      const midpoint = getSegmentMidpoint(
        planar.vertices[segment.startId],
        planar.vertices[segment.endId],
        segment.tangentStart,
        segment.tangentEnd,
      );

      if (capsuleSegmentIds.has(id.split('#')[0])) {
        const keep = originalFillPolygons.some(({ polygon }) => isPointInPolygonVertices(midpoint, polygon));

        keptCapsulePiece = keptCapsulePiece || keep;
        return keep;
      }

      const keep = !isPointInPolygonVertices(midpoint, capsulePolygon);

      droppedOriginalPiece = droppedOriginalPiece || !keep;
      return keep;
    }),
  );

  return { droppedOriginalPiece, keptCapsulePiece, keptSegments };
};
