// others
import { GUIDE_STROKE } from 'constant/canvas';
import {
  HIGHLIGHT_PADDING_PX,
  HIGHLIGHT_SHADOW_COLOR,
  HIGHLIGHT_SHADOW_EDGE,
  HIGHLIGHT_TEXT_COLOR,
  HIGHLIGHT_TEXT_GAP_PX,
  RULER_SIZE_PX,
} from '../../constants';

// types
import type { TRulerTick } from '../getRulerTicks';

export const paintHighlightedLeftTick = (ctx: CanvasRenderingContext2D, tick: TRulerTick, leftInset: number): void => {
  if (tick.screenPos >= RULER_SIZE_PX) {
    const textWidth = ctx.measureText(tick.label).width;
    const halfExtent = HIGHLIGHT_TEXT_GAP_PX + textWidth + HIGHLIGHT_PADDING_PX;
    const gradient = ctx.createLinearGradient(0, tick.screenPos - halfExtent, 0, tick.screenPos + halfExtent);

    gradient.addColorStop(0, HIGHLIGHT_SHADOW_EDGE);
    gradient.addColorStop(0.5, HIGHLIGHT_SHADOW_COLOR);
    gradient.addColorStop(1, HIGHLIGHT_SHADOW_EDGE);

    ctx.fillStyle = gradient;
    ctx.fillRect(leftInset, tick.screenPos - halfExtent, RULER_SIZE_PX, halfExtent * 2);

    ctx.strokeStyle = GUIDE_STROKE;
    ctx.beginPath();
    ctx.moveTo(leftInset, tick.screenPos);
    ctx.lineTo(leftInset + RULER_SIZE_PX, tick.screenPos);
    ctx.stroke();

    ctx.fillStyle = HIGHLIGHT_TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.save();
    ctx.translate(leftInset + RULER_SIZE_PX / 2, tick.screenPos);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(tick.label, HIGHLIGHT_TEXT_GAP_PX, 0);
    ctx.restore();
  }
};
