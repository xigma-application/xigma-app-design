// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

const rotateTangent = (tangent: TVectorTangent, degrees: number): TVectorTangent =>
  tangent ? rotatePoint(tangent, ORIGIN, degrees) : null;

export const rotateVectorNodeOrigin = (
  origin: TVectorNodeOrigin,
  pivot: TPoint,
  degrees: number,
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => ({
  segments: Object.fromEntries(
    Object.entries(origin.segments).map(([segmentId, segment]) => [
      segmentId,
      { ...segment, tangentEnd: rotateTangent(segment.tangentEnd, degrees), tangentStart: rotateTangent(segment.tangentStart, degrees) },
    ]),
  ),
  vertices: Object.fromEntries(
    Object.entries(origin.vertices).map(([vertexId, vertex]) => {
      const rotated = rotatePoint(vertex, pivot, degrees);
      return [vertexId, { id: vertexId, x: Math.round(rotated.x), y: Math.round(rotated.y) }];
    }),
  ),
});
