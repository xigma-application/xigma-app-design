// types
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGroupSelectionOutline } from './drawGroupSelectionOutline';
import { drawPerNodeSelectionOutlines } from './drawPerNodeSelectionOutlines/drawPerNodeSelectionOutlines';
import { isGroupSelection } from '../../../../utils/isGroupSelection';

export const drawSelectionOutline = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const { buffer, gl, program, viewport } = context;
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
      editingPathId,
    );
  }
};
