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

export const paintHighlightedTopTick = (ctx: CanvasRenderingContext2D, tick: TRulerTick, leftInset: number): void => {
  if (tick.screenPos >= leftInset + RULER_SIZE_PX) {
    const textWidth = ctx.measureText(tick.label).width;
    const halfExtent = HIGHLIGHT_TEXT_GAP_PX + textWidth + HIGHLIGHT_PADDING_PX;
    const gradient = ctx.createLinearGradient(tick.screenPos - halfExtent, 0, tick.screenPos + halfExtent, 0);

    gradient.addColorStop(0, HIGHLIGHT_SHADOW_EDGE);
    gradient.addColorStop(0.5, HIGHLIGHT_SHADOW_COLOR);
    gradient.addColorStop(1, HIGHLIGHT_SHADOW_EDGE);

    ctx.fillStyle = gradient;
    ctx.fillRect(tick.screenPos - halfExtent, 0, halfExtent * 2, RULER_SIZE_PX);

    ctx.strokeStyle = GUIDE_STROKE;
    ctx.beginPath();
    ctx.moveTo(tick.screenPos, 0);
    ctx.lineTo(tick.screenPos, RULER_SIZE_PX);
    ctx.stroke();

    ctx.fillStyle = HIGHLIGHT_TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.fillText(tick.label, tick.screenPos + HIGHLIGHT_TEXT_GAP_PX, RULER_SIZE_PX / 2);
  }
};
