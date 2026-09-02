// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getEqualSpacingGuides } from '../../../../utils/getEqualSpacingGuides/getEqualSpacingGuides';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { isContactGuideEligibleNode } from '../../../../utils/getShapeContactGuides';

const getActiveEqualSpacingNodeIds = (event: PointerEvent, selectionRefs: TSelectionToolRefs): string[] => {
  const resizeDrag = selectionRefs.resizeDragRef.current;

  switch (true) {
    case resizeDrag !== null:
      return Object.keys(resizeDrag.nodeOrigins);
    case event.altKey:
      return selectSelectedNodes(store.getState()).map((node) => node.id);
    default:
      return [];
  }
};

const isEligibleNode = (node: TSceneNode | undefined): node is TSceneNode => node !== undefined && isContactGuideEligibleNode(node);

export const resolveEqualSpacingGuides = (event: PointerEvent, canvasRefs: TCanvasRefs, selectionRefs: TSelectionToolRefs): void => {
  if (!selectionRefs.dragStateRef.current?.hasMoved) {
    const nodes = selectNodes(store.getState());
    const activeNodes = getActiveEqualSpacingNodeIds(event, selectionRefs)
      .map((id) => nodes[id])
      .filter(isEligibleNode);

    if (activeNodes.length > 0) {
      const activeIds = new Set(activeNodes.map((node) => node.id));
      const candidates = Object.values(nodes)
        .filter((node) => !activeIds.has(node.id) && isContactGuideEligibleNode(node))
        .map((node) => ({ bounds: getRotatedNodeBounds(node) }));
      const guides = activeNodes.map((activeNode) => getEqualSpacingGuides(getRotatedNodeBounds(activeNode), candidates));
      const labels = guides.flatMap((guide) => guide.labels);
      const lines = guides.flatMap((guide) => guide.lines);

      canvasRefs.transform.equalSpacingGuidesRef.current = lines.length > 0 ? { labels, lines } : null;
    } else {
      canvasRefs.transform.equalSpacingGuidesRef.current = null;
    }
  }

  return;
};
