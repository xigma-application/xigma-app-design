// types
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorSelectionOutline } from './drawVectorSelectionOutline';
import { isVectorBoundAsTextPath } from 'store/design/utils/isVectorBoundAsTextPath';

export const drawVectorSelectionOutlineUnlessTextPathGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  if (!isVectorBoundAsTextPath(nodesById, node.id) && node.id !== editingPathId) {
    drawVectorSelectionOutline(gl, program, buffer, node, vectorEditingNodeIds, canvasWidth, canvasHeight, viewport);
  }
};
