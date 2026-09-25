// types
import { TFlattenedVectorSegment, flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { TVectorNode } from 'types/design/types';
import { TPoint } from 'types/canvas';
import { TVectorStrokePath } from './types';

// utils
import { getAdjacency } from 'utils/canvas/vectorNetwork/getSimpleVectorChain/getAdjacency';

type TWalk = { adjacency: Map<string, TFlattenedVectorSegment[]>; visited: Set<string> };

const walkPath = (walk: TWalk, startVertexId: string, firstSegment: TFlattenedVectorSegment): { endVertexId: string; points: TPoint[] } => {
  const points: TPoint[] = [];
  let vertexId = startVertexId;
  let segment: TFlattenedVectorSegment | undefined = firstSegment;

  while (segment) {
    const forward = segment.startId === vertexId;

    walk.visited.add(segment.segmentId);
    points.push(...(forward ? segment.points : [...segment.points].reverse()).slice(points.length > 0 ? 1 : 0));
    vertexId = forward ? segment.endId : segment.startId;
    const nextSegments = walk.adjacency.get(vertexId);
    segment = nextSegments?.length === 2 ? nextSegments.find((next) => !walk.visited.has(next.segmentId)) : undefined;
  }

  return { endVertexId: vertexId, points };
};

const getOpenPaths = (walk: TWalk): TVectorStrokePath[] =>
  [...walk.adjacency.entries()]
    .filter(([, segments]) => segments.length !== 2)
    .flatMap(([vertexId, segments]) =>
      segments.flatMap((segment) =>
        walk.visited.has(segment.segmentId) ? [] : [{ closed: false, points: walkPath(walk, vertexId, segment).points }],
      ),
    );

const getClosedPaths = (walk: TWalk, segments: TFlattenedVectorSegment[]): TVectorStrokePath[] =>
  segments.flatMap((segment) => {
    if (!walk.visited.has(segment.segmentId)) {
      const { points } = walkPath(walk, segment.startId, segment);
      return [{ closed: true, points: points.slice(0, -1) }];
    }

    return [];
  });

export const getVectorStrokePaths = (node: TVectorNode): TVectorStrokePath[] => {
  const segments = flattenVectorSegments(node);
  const walk: TWalk = { adjacency: getAdjacency(segments), visited: new Set() };
  const openPaths = getOpenPaths(walk);

  return [...openPaths, ...getClosedPaths(walk, segments)];
};
