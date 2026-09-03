// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGroupSelectionOutline } from './drawGroupSelectionOutline';
import { drawPerNodeSelectionOutlines } from './drawPerNodeSelectionOutlines/drawPerNodeSelectionOutlines';
import { isGroupSelection } from '../../../../utils/isGroupSelection';
import { isSmartSelectionSwapDragActive } from '../../../../utils/isSmartSelectionSwapDragActive';

export const drawSelectionOutline = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  editingPathId?: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const nonVectorEditingNodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id));

  if (!isSmartSelectionSwapDragActive(refs)) {
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
        editingPathId,
      );
    }
  }
};
