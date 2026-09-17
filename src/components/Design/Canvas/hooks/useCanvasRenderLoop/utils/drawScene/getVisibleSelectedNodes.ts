// store
import { TImageEditorState } from 'store/design/types';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isCropModeFrameOnlyBeingDragged } from './isCropModeFrameOnlyBeingDragged';
import { isNodeTransforming } from './isNodeTransforming';

export const getVisibleSelectedNodes = (
  allSelectedNodes: TSceneNode[],
  editingNodeId: string | null,
  refs: TCanvasRefs,
  imageEditor: TImageEditorState | null = null,
): TSceneNode[] =>
  allSelectedNodes.filter(
    (node) =>
      node.id !== editingNodeId && (isCropModeFrameOnlyBeingDragged(refs, node.id, imageEditor) || !isNodeTransforming(refs, node.id)),
  );
