// others
import { RULER_SIZE_PX } from '../../constants';

export const paintRulerBackground = (
  ctx: CanvasRenderingContext2D,
  background: string,
  width: number,
  height: number,
  leftInset: number,
  rulerRight: number,
): void => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(leftInset, 0, rulerRight - leftInset, RULER_SIZE_PX);
  ctx.fillRect(leftInset, 0, RULER_SIZE_PX, height);
};
