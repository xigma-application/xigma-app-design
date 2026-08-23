// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TLineNetworkCrossing } from './types';

// utils
import { flattenForCrossingSearch } from '../planarizeVectorNetwork/flattenForCrossingSearch';
import { findSegmentCrossings } from '../planarizeVectorNetwork/findSegmentCrossings';
import { refineCrossing } from '../planarizeVectorNetwork/refineCrossing';

const CUT_LINE_START_ID = '__cut-line-start';
const CUT_LINE_END_ID = '__cut-line-end';

export const findLineNetworkCrossings = (
  lineStart: TPoint,
  lineEnd: TPoint,
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TLineNetworkCrossing[] => {
  const lineSegment: TVectorSegment = {
    endId: CUT_LINE_END_ID,
    id: '__cut-line',
    startId: CUT_LINE_START_ID,
    tangentEnd: null,
    tangentStart: null,
  };
  const mergedVertices = {
    ...vertices,
    [CUT_LINE_END_ID]: { id: CUT_LINE_END_ID, x: lineEnd.x, y: lineEnd.y },
    [CUT_LINE_START_ID]: { id: CUT_LINE_START_ID, x: lineStart.x, y: lineStart.y },
  };
  const flattenedLine = flattenForCrossingSearch(lineSegment, mergedVertices);

  return Object.values(segments).flatMap((segment) => {
    const flattenedSegment = flattenForCrossingSearch(segment, vertices);

    return findSegmentCrossings(flattenedLine, flattenedSegment).map((coarseCrossing) => {
      const refined = refineCrossing(
        lineSegment,
        segment,
        mergedVertices,
        coarseCrossing.tA,
        1 / (flattenedLine.length - 1),
        coarseCrossing.tB,
        1 / (flattenedSegment.length - 1),
      );

      return { lineT: refined.tA, point: refined.point, segmentId: segment.id, t: refined.tB };
    });
  });
};
