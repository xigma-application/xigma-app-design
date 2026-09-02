// others
import { RULER_FRAME_EXTENT_EDGE_FILL } from 'constant/canvas';
import { EDGE_LABEL_NUDGE_PX, RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../constants';

// types
import type { TRulerBand } from '../getRulerBands';

// utils
import { crisp } from './crisp';

const paintEdge = (
  ctx: CanvasRenderingContext2D,
  edgePx: number,
  label: string,
  leftInset: number,
  height: number,
  nudge: number,
): void => {
  if (edgePx >= RULER_SIZE_PX && edgePx <= height) {
    const x = leftInset + RULER_SIZE_PX;

    ctx.beginPath();
    ctx.moveTo(x, crisp(edgePx));
    ctx.lineTo(x - RULER_TICK_LENGTH_PX, crisp(edgePx));
    ctx.stroke();
    ctx.save();
    ctx.translate(x - RULER_SIZE_PX / 2, edgePx + nudge);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
};

export const paintLeftBandEdges = (ctx: CanvasRenderingContext2D, band: TRulerBand, leftInset: number, height: number): void => {
  if (band.edges) {
    ctx.strokeStyle = RULER_FRAME_EXTENT_EDGE_FILL;
    ctx.fillStyle = RULER_FRAME_EXTENT_EDGE_FILL;
    ctx.textAlign = 'center';
    paintEdge(ctx, band.fromPx, band.edges.fromLabel, leftInset, height, EDGE_LABEL_NUDGE_PX);
    paintEdge(ctx, band.toPx, band.edges.toLabel, leftInset, height, -EDGE_LABEL_NUDGE_PX);
  }
};
