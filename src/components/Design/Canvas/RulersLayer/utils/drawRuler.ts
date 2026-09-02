// others
import { RULER_BACKGROUND, RULER_TEXT_FILL, RULER_TICK_STROKE } from 'constant/canvas';
import { RULER_FONT, RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../constants';

// types
import { TViewport } from 'types/design/types';

// utils
import { getRulerTicks, type TRulerTick } from './getRulerTicks';

export type TDrawRulerParams = {
  height: number;
  leftInset: number;
  rightInset: number;
  viewport: TViewport;
  width: number;
};

const crisp = (value: number): number => Math.round(value) + 0.5;

const paintTopTick = (ctx: CanvasRenderingContext2D, { label, screenPos }: TRulerTick, leftInset: number): void => {
  if (screenPos >= leftInset + RULER_SIZE_PX) {
    ctx.beginPath();
    ctx.moveTo(crisp(screenPos), RULER_SIZE_PX);
    ctx.lineTo(crisp(screenPos), RULER_SIZE_PX - RULER_TICK_LENGTH_PX);
    ctx.stroke();
    ctx.fillText(label, screenPos, RULER_SIZE_PX / 2);
  }
};

const paintLeftTick = (ctx: CanvasRenderingContext2D, { label, screenPos }: TRulerTick, leftInset: number): void => {
  if (screenPos >= RULER_SIZE_PX) {
    const x = leftInset + RULER_SIZE_PX;

    ctx.beginPath();
    ctx.moveTo(x, crisp(screenPos));
    ctx.lineTo(x - RULER_TICK_LENGTH_PX, crisp(screenPos));
    ctx.stroke();
    ctx.save();
    ctx.translate(x - RULER_SIZE_PX / 2, screenPos);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
};

export const drawRuler = (ctx: CanvasRenderingContext2D, { height, leftInset, rightInset, viewport, width }: TDrawRulerParams): void => {
  ctx.clearRect(0, 0, width, height);

  const rulerRight = width - rightInset;

  ctx.fillStyle = RULER_BACKGROUND;
  ctx.fillRect(leftInset, 0, rulerRight - leftInset, RULER_SIZE_PX);
  ctx.fillRect(leftInset, 0, RULER_SIZE_PX, height);

  ctx.font = RULER_FONT;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.strokeStyle = RULER_TICK_STROKE;
  ctx.fillStyle = RULER_TEXT_FILL;

  getRulerTicks(rulerRight, viewport.x, viewport.zoom).forEach((tick) => paintTopTick(ctx, tick, leftInset));
  getRulerTicks(height, viewport.y, viewport.zoom).forEach((tick) => paintLeftTick(ctx, tick, leftInset));
};
