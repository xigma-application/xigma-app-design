// others
import { RULER_SIZE_PX } from '../../constants';

// utils
import { crisp } from './crisp';

export const paintRulerCorner = (ctx: CanvasRenderingContext2D, leftInset: number): void => {
  const right = leftInset + RULER_SIZE_PX;

  ctx.beginPath();
  ctx.moveTo(leftInset, crisp(RULER_SIZE_PX));
  ctx.lineTo(crisp(right), crisp(RULER_SIZE_PX));
  ctx.lineTo(crisp(right), 0);
  ctx.stroke();
};
