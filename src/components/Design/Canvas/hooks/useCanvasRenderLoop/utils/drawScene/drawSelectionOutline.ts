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
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): void => {
  const nonVectorEditingNodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id));

  if (isGroupSelection(nonVectorEditingNodes)) {
    drawGroupSelectionOutline(gl, program, buffer, nonVectorEditingNodes, canvasWidth, canvasHeight, viewport);
  } else {
    drawPerNodeSelectionOutlines(
      gl,
      program,
      buffer,
      nonVectorEditingNodes,
      canvasWidth,
      canvasHeight,
      viewport,
      vectorEditingNodeIds,
      nodesById,
    );
  }
};
