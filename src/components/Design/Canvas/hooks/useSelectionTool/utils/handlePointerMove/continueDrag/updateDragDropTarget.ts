// store
import { getAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget';
import { getNodeAxisAlignedBounds } from 'store/design/utils/getNodeAxisAlignedBounds';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, RootState } from 'store';

// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragDropTargetFrame } from './getDragDropTargetFrame';

export const updateDragDropTarget = (
  dispatch: AppDispatch,
  state: RootState,
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  canvasRefs: TCanvasRefs,
): void => {
  canvasRefs.transform.dropTargetFrameIdRef.current = null;
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;

  const canReparent = selectedNodes.length > 0 && !selectedNodes.some((node) => node.type === NodeType.section);

  if (canReparent) {
    const currentParent = selectedNodes[0].parentId ? nodesById[selectedNodes[0].parentId] : null;
    const currentParentId = currentParent?.id ?? null;
    const movedNodeIds = selectedNodes.map((node) => node.id);
    const desiredParentId = getDragDropTargetFrame(movedNodeIds, point, renderOrderedNodes, nodesById);
    const canDragOutToRoot = currentParent !== null && isDropTargetContainer(currentParent);
    const desiredParent = desiredParentId ? nodesById[desiredParentId] : null;

    canvasRefs.transform.dropTargetFrameIdRef.current = desiredParentId;

    if (
      desiredParent &&
      desiredParent.type === NodeType.frame &&
      (desiredParent.layoutMode === LayoutMode.horizontal || desiredParent.layoutMode === LayoutMode.vertical) &&
      desiredParentId &&
      desiredParentId !== currentParentId
    ) {
      const siblingSizes = desiredParent.childIds
        .filter((id) => !movedNodeIds.includes(id))
        .map((id) => nodesById[id])
        .filter(Boolean)
        .map((sibling) => {
          const bounds = getNodeAxisAlignedBounds(sibling);

          return { height: bounds.height, id: sibling.id, width: bounds.width };
        });

      canvasRefs.transform.autoLayoutDropTargetRef.current = {
        frameId: desiredParentId,
        ...getAutoLayoutDropTarget(
          desiredParent.layoutMode,
          desiredParent.itemSpacing ?? 0,
          desiredParent.layoutAlignment ?? AlignmentLayout.topLeft,
          desiredParent,
          siblingSizes,
          getNodesBoundingBox(selectedNodes),
          point,
        ),
      };
    } else if (desiredParentId !== currentParentId && (desiredParentId !== null || canDragOutToRoot)) {
      const page = selectActivePage(state);
      const targetParent = desiredParentId ? page.nodes[desiredParentId] : null;
      const targetIndex = targetParent && isContainerNode(targetParent) ? targetParent.childIds.length : page.rootOrder.length;

      dispatch(moveNodes({ nodeIds: movedNodeIds, targetIndex, targetParentId: desiredParentId }));
    }
  }
};
