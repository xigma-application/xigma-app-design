// types
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawGroupSelectionOutline } from './drawGroupSelectionOutline';
import { drawPerNodeSelectionOutlines } from './drawPerNodeSelectionOutlines/drawPerNodeSelectionOutlines';
import { isGroupSelection } from '../../../../utils/isGroupSelection';

export const drawSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  vectorEditingNodeId: string | null,
): void => {
  if (isGroupSelection(selectedNodes)) {
    drawGroupSelectionOutline(gl, program, buffer, selectedNodes, canvasWidth, canvasHeight, viewport);
  } else {
    drawPerNodeSelectionOutlines(gl, program, buffer, selectedNodes, canvasWidth, canvasHeight, viewport, vectorEditingNodeId);
  }
};
