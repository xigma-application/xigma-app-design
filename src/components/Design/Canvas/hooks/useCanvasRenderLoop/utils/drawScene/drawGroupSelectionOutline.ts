// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawRect } from 'utils/canvas/drawRect';
import { getSelectionBounds } from '../../../../utils/getSelectionBounds';

export const drawGroupSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const bounds = getSelectionBounds(selectedNodes);

  drawRect(gl, program, buffer, { ...bounds, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport);
  drawCornerHandles(gl, program, buffer, bounds, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
};
