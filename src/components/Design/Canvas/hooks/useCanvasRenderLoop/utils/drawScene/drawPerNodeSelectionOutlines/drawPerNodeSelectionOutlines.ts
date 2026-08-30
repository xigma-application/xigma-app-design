// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawDefaultSelectionOutline } from './drawDefaultSelectionOutline';
import { drawLineSelectionOutline } from './drawLineSelectionOutline';
import { drawVectorSelectionOutlineUnlessTextPathGuide } from './drawVectorSelectionOutlineUnlessTextPathGuide';

export const drawPerNodeSelectionOutlines = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        drawLineSelectionOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.path:
        break;
      case NodeType.vector:
        drawVectorSelectionOutlineUnlessTextPathGuide(
          gl,
          program,
          buffer,
          node,
          canvasWidth,
          canvasHeight,
          viewport,
          vectorEditingNodeIds,
          nodesById,
          editingPathId,
        );
        break;
      default:
        drawDefaultSelectionOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, nodesById);
    }
  });
};
