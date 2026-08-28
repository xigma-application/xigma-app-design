// types
import { TVectorSegment } from 'types/design/types';

export const isRawSegmentTopologyUnchanged = (
  prevSegments: Record<string, TVectorSegment>,
  nextSegments: Record<string, TVectorSegment>,
): boolean => {
  const prevIds = Object.keys(prevSegments);
  const nextIds = Object.keys(nextSegments);

  if (prevIds.length !== nextIds.length) {
    return false;
  }

  return nextIds.every((id) => {
    const prevSegment = prevSegments[id];
    const nextSegment = nextSegments[id];

    return Boolean(
      prevSegment &&
      (prevSegment === nextSegment || (prevSegment.startId === nextSegment.startId && prevSegment.endId === nextSegment.endId)),
    );
  });
};
