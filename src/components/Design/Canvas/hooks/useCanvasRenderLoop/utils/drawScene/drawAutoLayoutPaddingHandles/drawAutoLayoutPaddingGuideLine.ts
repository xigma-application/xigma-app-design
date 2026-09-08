// others
import { AUTO_LAYOUT_PADDING_GUIDE_STROKE } from 'constant/canvas';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { rotatePoint } from 'utils/math/rotatePoint';

const GUIDE_LINE_BY_SIDE: Record<TAutoLayoutPaddingSide, (frame: TDraftRect, band: TDraftRect) => { from: TPoint; to: TPoint }> = {
  bottom: (frame, band) => ({ from: { x: frame.x, y: band.y }, to: { x: frame.x + frame.width, y: band.y } }),
  left: (frame, band) => ({ from: { x: band.x + band.width, y: frame.y }, to: { x: band.x + band.width, y: frame.y + frame.height } }),
  right: (frame, band) => ({ from: { x: band.x, y: frame.y }, to: { x: band.x, y: frame.y + frame.height } }),
  top: (frame, band) => ({ from: { x: frame.x, y: band.y + band.height }, to: { x: frame.x + frame.width, y: band.y + band.height } }),
};

export const drawAutoLayoutPaddingGuideLine = (
  context: TDrawSceneContext,
  frame: TDraftRect,
  band: TDraftRect,
  side: TAutoLayoutPaddingSide,
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const { from, to } = GUIDE_LINE_BY_SIDE[side](frame, band);
  const rotatedFrom = rotatePoint(from, frameCenter, frameRotation);
  const rotatedTo = rotatePoint(to, frameCenter, frameRotation);

  drawLine(
    gl,
    program,
    buffer,
    { x1: rotatedFrom.x, x2: rotatedTo.x, y1: rotatedFrom.y, y2: rotatedTo.y },
    AUTO_LAYOUT_PADDING_GUIDE_STROKE,
    1 / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
