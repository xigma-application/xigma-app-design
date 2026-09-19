// types
import { StrokeAlign, StrokeProfile } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokePolygons } from './getBoxStrokePolygons';
import { getLoopArcLengthPositions } from 'utils/canvas/getLoopArcLengthPositions';
import { getQuarterTaperBoxStrokePolygons } from './getQuarterTaperBoxStrokePolygons';
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';

const lerpPoint = (from: TPoint, to: TPoint, t: number): TPoint => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

export const getBoxStrokeProfilePolygons = (
  node: TFrameNode | TRectangleNode,
  width: number,
  strokeAlign: StrokeAlign | undefined,
  profile: StrokeProfile,
  flipped: boolean,
): TPoint[][] => {
  if (profile !== StrokeProfile.quarterTaper) {
    const [outerLoop, innerLoop] = getBoxStrokePolygons(node, { bottom: width, left: width, right: width, top: width }, strokeAlign);
    const positions = getLoopArcLengthPositions(outerLoop);

    const profiledInnerLoop = innerLoop.map((point, index) => {
      const multiplier = getStrokeProfileWidthMultiplier(profile, positions[index], flipped);
      return lerpPoint(outerLoop[index], point, multiplier);
    });

    return [outerLoop, profiledInnerLoop];
  }

  return getQuarterTaperBoxStrokePolygons(node, width, strokeAlign, flipped);
};
