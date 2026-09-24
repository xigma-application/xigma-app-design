// types
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRectBuffer } from 'utils/canvas/drawRectBatch/drawRectBuffer';
import { getDotBuffer } from './getDotBuffer';
import { getRectBatchResources } from 'utils/canvas/drawRectBatch/getRectBatchResources';
import { setRectBatchUniforms } from 'utils/canvas/drawRectBatch/setRectBatchUniforms';

export const drawSwapHandleDots = (
  gl: WebGL2RenderingContext,
  layout: TSmartSelectionLayout,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const resources = getRectBatchResources(gl);
  const dots = resources ? getDotBuffer(gl, layout, viewport.zoom) : null;

  if (resources && dots) {
    setRectBatchUniforms(gl, resources.program, canvasWidth, canvasHeight, viewport);
    drawRectBuffer(gl, dots.buffer, dots.vertexCount);
  }
};
