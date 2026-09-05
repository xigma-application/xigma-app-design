// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { getShapeContactGuides, isContactGuideEligibleNode } from '../../../../utils/getShapeContactGuides';
import { isAutoLayoutDropTargetActive } from 'utils/canvas/signals/isAutoLayoutDropTargetActive';

const getActiveContactNodeIds = (event: PointerEvent, selectionRefs: TSelectionToolRefs): string[] => {
  const resizeDrag = selectionRefs.resizeDragRef.current;
  const drag = selectionRefs.dragStateRef.current;

  switch (true) {
    case resizeDrag !== null:
      return Object.keys(resizeDrag.nodeOrigins);
    case drag?.hasMoved:
      return Object.keys(drag.nodeOrigins);
    case event.altKey:
      return selectSelectedNodes(store.getState()).map((node) => node.id);
    default:
      return [];
  }
};

const isEligibleNode = (node: TSceneNode | undefined): node is TSceneNode => node !== undefined && isContactGuideEligibleNode(node);

export const resolveShapeContactGuides = (event: PointerEvent, canvasRefs: TCanvasRefs, selectionRefs: TSelectionToolRefs): void => {
  if (isAutoLayoutDropTargetActive(canvasRefs)) {
    canvasRefs.transform.contactGuidesRef.current = null;
  } else {
    const nodes = selectNodes(store.getState());
    const activeNodes = getActiveContactNodeIds(event, selectionRefs)
      .map((id) => nodes[id])
      .filter(isEligibleNode);

    if (activeNodes.length > 0) {
      const activeIds = activeNodes.map((node) => node.id);
      const candidates = Object.values(nodes)
        .filter((node) => !getIsDescendantOfMovedNodes(node.id, activeIds, nodes) && isContactGuideEligibleNode(node))
        .map((node) => ({ bounds: getRotatedNodeBounds(node), id: node.id }));
      const guides = activeNodes.flatMap((activeNode) => getShapeContactGuides(getRotatedNodeBounds(activeNode), candidates));

      canvasRefs.transform.contactGuidesRef.current = guides.length > 0 ? guides : null;
    } else {
      canvasRefs.transform.contactGuidesRef.current = null;
    }
  }
};
