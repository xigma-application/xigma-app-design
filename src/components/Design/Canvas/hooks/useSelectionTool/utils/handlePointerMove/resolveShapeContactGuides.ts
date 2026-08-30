// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { getShapeContactGuides, isContactGuideEligibleNode } from '../../../../utils/getShapeContactGuides';

const getSingleOriginId = (nodeOrigins: Record<string, unknown>): string | null => {
  const ids = Object.keys(nodeOrigins);

  return ids.length === 1 ? ids[0] : null;
};

const getActiveContactNodeId = (event: PointerEvent, selectionRefs: TSelectionToolRefs): string | null => {
  const resizeDrag = selectionRefs.resizeDragRef.current;

  if (resizeDrag) {
    return getSingleOriginId(resizeDrag.nodeOrigins);
  }

  const drag = selectionRefs.dragStateRef.current;

  if (drag?.hasMoved) {
    return getSingleOriginId(drag.nodeOrigins);
  }

  if (event.altKey) {
    const selected = selectSelectedNodes(store.getState());

    return selected.length === 1 ? selected[0].id : null;
  }

  return null;
};

export const resolveShapeContactGuides = (event: PointerEvent, canvasRefs: TCanvasRefs, selectionRefs: TSelectionToolRefs): void => {
  const activeId = getActiveContactNodeId(event, selectionRefs);
  const nodes = selectNodes(store.getState());
  const activeNode = activeId ? nodes[activeId] : undefined;

  if (activeNode && isContactGuideEligibleNode(activeNode)) {
    const candidates = Object.values(nodes)
      .filter((node) => node.id !== activeId && isContactGuideEligibleNode(node))
      .map((node) => ({ bounds: getRotatedNodeBounds(node), id: node.id }));
    const guides = getShapeContactGuides(getRotatedNodeBounds(activeNode), candidates);

    canvasRefs.transform.contactGuidesRef.current = guides.length > 0 ? guides : null;
  } else {
    canvasRefs.transform.contactGuidesRef.current = null;
  }
};
