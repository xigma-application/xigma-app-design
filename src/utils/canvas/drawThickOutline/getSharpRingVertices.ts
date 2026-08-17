// types
import { TDraftRect } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

export const getSharpRingVertices = (rect: TDraftRect, halfWidth: number): number[] => {
  const outerX1 = rect.x - halfWidth;
  const outerY1 = rect.y - halfWidth;
  const outerX2 = rect.x + rect.width + halfWidth;
  const outerY2 = rect.y + rect.height + halfWidth;
  const innerX1 = rect.x + halfWidth;
  const innerY1 = rect.y + halfWidth;
  const innerX2 = rect.x + rect.width - halfWidth;
  const innerY2 = rect.y + rect.height - halfWidth;

  return [
    ...getQuadVertices(outerX1, outerY1, outerX2, outerY1, outerX2, innerY1, outerX1, innerY1), // top
    ...getQuadVertices(outerX1, innerY2, outerX2, innerY2, outerX2, outerY2, outerX1, outerY2), // bottom
    ...getQuadVertices(outerX1, innerY1, innerX1, innerY1, innerX1, innerY2, outerX1, innerY2), // left
    ...getQuadVertices(innerX2, innerY1, outerX2, innerY1, outerX2, innerY2, innerX2, innerY2), // right
  ];
};
