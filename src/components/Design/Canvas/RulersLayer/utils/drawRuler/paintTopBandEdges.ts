// others
import { RULER_FRAME_EXTENT_EDGE_FILL } from 'constant/canvas';
import { EDGE_LABEL_GAP_PX, RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../constants';

// types
import type { TRulerBand } from '../getRulerBands';

// utils
import { crisp } from './crisp';
import { labelFade } from './labelFade';

const paintEdge = (
  ctx: CanvasRenderingContext2D,
  edgePx: number,
  label: string,
  align: 'left' | 'right',
  leftInset: number,
  rulerRight: number,
  alpha: number | null,
): void => {
  if (alpha !== null && edgePx >= leftInset + RULER_SIZE_PX && edgePx <= rulerRight) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(crisp(edgePx), RULER_SIZE_PX);
    ctx.lineTo(crisp(edgePx), RULER_SIZE_PX - RULER_TICK_LENGTH_PX);
    ctx.stroke();
    ctx.textAlign = align;
    ctx.fillText(label, edgePx + (align === 'left' ? EDGE_LABEL_GAP_PX : -EDGE_LABEL_GAP_PX), RULER_SIZE_PX / 2);
  }
};

export const paintTopBandEdges = (
  ctx: CanvasRenderingContext2D,
  band: TRulerBand,
  leftInset: number,
  rulerRight: number,
  guideScreenPos: number | null,
  stepPx: number,
): void => {
  if (band.edges) {
    const fromAlpha = guideScreenPos === null ? 1 : labelFade(Math.abs(band.fromPx - guideScreenPos), stepPx);
    const toAlpha = guideScreenPos === null ? 1 : labelFade(Math.abs(band.toPx - guideScreenPos), stepPx);

    ctx.strokeStyle = RULER_FRAME_EXTENT_EDGE_FILL;
    ctx.fillStyle = RULER_FRAME_EXTENT_EDGE_FILL;
    paintEdge(ctx, band.fromPx, band.edges.fromLabel, 'left', leftInset, rulerRight, fromAlpha);
    paintEdge(ctx, band.toPx, band.edges.toLabel, 'right', leftInset, rulerRight, toAlpha);
    ctx.globalAlpha = 1;
  }
};
