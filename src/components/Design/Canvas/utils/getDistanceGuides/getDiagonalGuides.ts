// types
import { TDistanceGuides, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getHorizontalGuide } from './getHorizontalGuide';
import { getVerticalGuide } from './getVerticalGuide';

export const getDiagonalGuides = (active: TEdges, target: TEdges, activeRect: TDraftRect): TDistanceGuides => {
  const anchorX = activeRect.x + activeRect.width / 2;
  const anchorY = activeRect.y + activeRect.height / 2;
  const horizontal = getHorizontalGuide(active, target, anchorY);
  const vertical = getVerticalGuide(active, target, anchorX);
  const targetFacingX = horizontal.targetX;
  const targetFacingY = vertical.targetY;

  return {
    labels: [horizontal.label, vertical.label],
    lines: [
      horizontal.line,
      vertical.line,
      { dashed: true, x1: targetFacingX, x2: targetFacingX, y1: anchorY, y2: targetFacingY },
      { dashed: true, x1: anchorX, x2: targetFacingX, y1: targetFacingY, y2: targetFacingY },
    ],
  };
};
