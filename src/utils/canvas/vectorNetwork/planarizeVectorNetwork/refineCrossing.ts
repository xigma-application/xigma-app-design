// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// others
import { REFINE_ROUNDS, REFINE_SAMPLES } from './constants';

// utils
import { evaluateCubicBezier } from './evaluateCubicBezier';
import { findSegmentCrossings } from './findSegmentCrossings';
import { getSubArcPoints } from './getSubArcPoints';

export const refineCrossing = (
  segmentA: TVectorSegment,
  segmentB: TVectorSegment,
  vertices: Record<string, TVectorVertex>,
  initialTA: number,
  initialWindowA: number,
  initialTB: number,
  initialWindowB: number,
): { tA: number; tB: number; point: TPoint } => {
  let tA = initialTA;
  let tB = initialTB;
  let windowA = initialWindowA;
  let windowB = initialWindowB;

  for (let round = 0; round < REFINE_ROUNDS; round += 1) {
    const loA = Math.max(0, tA - windowA);
    const hiA = Math.min(1, tA + windowA);
    const loB = Math.max(0, tB - windowB);
    const hiB = Math.min(1, tB + windowB);
    const refined = findSegmentCrossings(
      getSubArcPoints(segmentA, vertices, loA, hiA, REFINE_SAMPLES),
      getSubArcPoints(segmentB, vertices, loB, hiB, REFINE_SAMPLES),
    )[0];

    if (refined) {
      tA = loA + refined.tA * (hiA - loA);
      tB = loB + refined.tB * (hiB - loB);
      windowA = (hiA - loA) / REFINE_SAMPLES;
      windowB = (hiB - loB) / REFINE_SAMPLES;
    }
  }

  return {
    point: evaluateCubicBezier(vertices[segmentA.startId], vertices[segmentA.endId], segmentA.tangentStart, segmentA.tangentEnd, tA),
    tA,
    tB,
  };
};
