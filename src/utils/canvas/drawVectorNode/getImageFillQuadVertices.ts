// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TImageFillCoverUv } from './getImageFillCoverUv';

// utils
import { getRotatedFillUvCorner } from './getRotatedFillUvCorner';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getImageFillQuadVertices = (rect: TDraftRect, uv: TImageFillCoverUv, uvRotation: number, quadRotation = 0): number[] => {
  const { height, width, x, y } = rect;
  const center: TPoint = { x: x + width / 2, y: y + height / 2 };
  const { x: x1, y: y1 } = rotatePoint({ x, y }, center, quadRotation);
  const { x: x2, y: y2 } = rotatePoint({ x: x + width, y }, center, quadRotation);
  const { x: x3, y: y3 } = rotatePoint({ x: x + width, y: y + height }, center, quadRotation);
  const { x: x4, y: y4 } = rotatePoint({ x, y: y + height }, center, quadRotation);
  const tl = getRotatedFillUvCorner(uv.uMin, uv.vMin, uvRotation);
  const tr = getRotatedFillUvCorner(uv.uMax, uv.vMin, uvRotation);
  const br = getRotatedFillUvCorner(uv.uMax, uv.vMax, uvRotation);
  const bl = getRotatedFillUvCorner(uv.uMin, uv.vMax, uvRotation);

  return [x1, y1, tl.u, tl.v, x2, y2, tr.u, tr.v, x3, y3, br.u, br.v, x1, y1, tl.u, tl.v, x3, y3, br.u, br.v, x4, y4, bl.u, bl.v];
};
