// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { transformCoord } from '../transformCoord';

const scaleTangent = (tangent: TVectorTangent, scaleX: number, scaleY: number): TVectorTangent =>
  tangent ? { x: tangent.x * scaleX, y: tangent.y * scaleY } : null;

const resizeVectorSegments = (segments: Record<string, TVectorSegment>, scaleX: number, scaleY: number): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries(segments).map(([segmentId, segment]) => [
      segmentId,
      {
        ...segment,
        tangentEnd: scaleTangent(segment.tangentEnd, scaleX, scaleY),
        tangentStart: scaleTangent(segment.tangentStart, scaleX, scaleY),
      },
    ]),
  );

const resizeVectorVertices = (
  vertices: Record<string, TPoint>,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).map(([vertexId, vertex]) => [
      vertexId,
      {
        id: vertexId,
        x: Math.round(transformCoord(vertex.x, anchors.x, scaleX)),
        y: Math.round(transformCoord(vertex.y, anchors.y, scaleY)),
      },
    ]),
  );

export const resizeVectorNode = (
  id: string,
  origin: TVectorNodeOrigin,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): void => {
  dispatch(
    updateNode({
      changes: {
        segments: resizeVectorSegments(origin.segments, scaleX, scaleY),
        vertices: resizeVectorVertices(origin.vertices, anchors, scaleX, scaleY),
      },
      id,
    }),
  );
};
