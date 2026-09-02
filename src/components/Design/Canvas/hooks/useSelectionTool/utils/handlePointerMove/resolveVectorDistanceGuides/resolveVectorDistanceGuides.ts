// store
import { selectActiveTool, selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getAnchor } from './getAnchor';
import { getBakedEditingNodes } from './getBakedEditingNodes';
import { getTarget } from './getTarget';
import { getVectorDistanceGuides } from '../../../../../utils/getVectorDistanceGuides/getVectorDistanceGuides';

export const resolveVectorDistanceGuides = (
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const editingNodeIds = selectVectorEditingNodeIds(state);

  if (editingNodeIds.length !== 0) {
    const isMeasuring = selectActiveTool(state) === ToolName.move && event.altKey && event.buttons === 0;
    const bakedNodes = isMeasuring ? getBakedEditingNodes(selectNodes(state), editingNodeIds) : [];
    const anchor = isMeasuring
      ? getAnchor(
          bakedNodes,
          canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current ?? [],
          canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current ?? [],
        )
      : null;
    const target = anchor
      ? getTarget(
          bakedNodes,
          anchor.anchorVertexId,
          canvasRefs.hover.hoveredVectorVertexIdRef.current,
          canvasRefs.hover.hoveredVectorSegmentIdRef.current,
        )
      : null;

    if (anchor && target) {
      canvasRefs.transform.distanceGuidesRef.current = getVectorDistanceGuides({ point: anchor.point }, target);
      setClassName('distance-measure');
    } else {
      canvasRefs.transform.distanceGuidesRef.current = null;
    }
  }
};
