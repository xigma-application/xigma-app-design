// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TImageEditorState } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGroupSelectionOutline } from './drawGroupSelectionOutline';
import { drawPerNodeSelectionOutlines } from './drawPerNodeSelectionOutlines/drawPerNodeSelectionOutlines';
import { getSelectionGroups } from '../../../../utils/getSelectionGroups';
import { isGroupSelection } from '../../../../utils/isGroupSelection';
import { isSmartSelectionSwapDragActive } from '../../../../utils/isSmartSelectionSwapDragActive';

export const drawSelectionOutline = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  imageEditor: TImageEditorState | null,
  editingPathId?: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const nonVectorEditingNodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id));

  if (!isSmartSelectionSwapDragActive(refs)) {
    getSelectionGroups(nonVectorEditingNodes).forEach((group) => {
      if (isGroupSelection(group)) {
        drawGroupSelectionOutline(gl, program, buffer, group, canvasWidth, canvasHeight, viewport);
      } else {
        drawPerNodeSelectionOutlines(
          gl,
          program,
          buffer,
          group,
          canvasWidth,
          canvasHeight,
          viewport,
          vectorEditingNodeIds,
          nodesById,
          imageEditor,
          editingPathId,
        );
      }
    });
  }
};
