// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';

const ANGLE_SAMPLE_SEGMENT_COUNT = 20;

// A curve's raw instantaneous tangent is the mathematically "correct" departure direction in the
// limit, but sampling it at t=0 exactly is unstable for rotation-system sorting at a shared vertex:
// a curve whose tangent points one way but immediately bends back toward its real endpoint can end
// up sorted on the wrong side of a nearby straight edge relative to the graph's actual topology,
// splitting what should be one bounded face into two (or merging two into one) — found live on a
// branch vertex where a curve's tangent pointed far from its own chord. Sampling a real point a short
// way along the flattened curve instead (still effectively "at" the vertex, but past the t=0
// instability) reflects the curve's true local direction of travel and resolves this — verified
// against an isolated minimal repro (a crossing-adjacent branch vertex) exhaustively across every
// sample distance from 1% to 50% along the curve, all producing the topologically correct face count.
export const getVectorHalfEdgeAngle = (segment: TVectorSegment, from: TVectorVertex, to: TVectorVertex): number => {
  const forward = segment.startId === from.id;
  const tangentAtFrom = forward ? segment.tangentStart : segment.tangentEnd;
  const tangentAtTo = forward ? segment.tangentEnd : segment.tangentStart;

  if (tangentAtFrom) {
    const points = flattenSegment(from, to, tangentAtFrom, tangentAtTo, ANGLE_SAMPLE_SEGMENT_COUNT);
    const sample = points[1];

    return Math.atan2(sample.y - from.y, sample.x - from.x);
  }

  return Math.atan2(to.y - from.y, to.x - from.x);
};
