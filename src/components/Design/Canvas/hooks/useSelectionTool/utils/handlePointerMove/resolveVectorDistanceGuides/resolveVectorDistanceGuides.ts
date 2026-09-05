// store
import { selectActiveTool, selectNodes, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getAnchor } from './getAnchor';
import { getAnchorReferencePoint } from './getAnchorReferencePoint';
import { getBakedEditingNodes } from './getBakedEditingNodes';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getTarget } from './getTarget';
import { getVectorDistanceGuides } from '../../../../../utils/getVectorDistanceGuides/getVectorDistanceGuides';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolveVectorDistanceGuides = (
  canvas: HTMLCanvasElement,
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
          anchor.excludeVertexIds,
          canvasRefs.hover.hoveredVectorVertexIdRef.current,
          canvasRefs.hover.hoveredVectorSegmentIdRef.current,
          canvasRefs.hover.hoveredVectorFaceSelectRef.current,
          screenToWorld(getPointerPosition(canvas, event), selectViewport(state)),
          getAnchorReferencePoint(anchor),
        )
      : null;

    if (anchor && target) {
      canvasRefs.transform.distanceGuidesRef.current = getVectorDistanceGuides(anchor, target);
      setClassName('distance-measure');
    } else {
      canvasRefs.transform.distanceGuidesRef.current = null;
    }
  }
};
