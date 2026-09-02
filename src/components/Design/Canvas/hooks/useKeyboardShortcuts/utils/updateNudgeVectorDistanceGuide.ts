// store
import { selectActiveTool, selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getAnchor } from '../../useSelectionTool/utils/handlePointerMove/resolveVectorDistanceGuides/getAnchor';
import { getAnchorReferencePoint } from '../../useSelectionTool/utils/handlePointerMove/resolveVectorDistanceGuides/getAnchorReferencePoint';
import { getBakedEditingNodes } from '../../useSelectionTool/utils/handlePointerMove/resolveVectorDistanceGuides/getBakedEditingNodes';
import { getTarget } from '../../useSelectionTool/utils/handlePointerMove/resolveVectorDistanceGuides/getTarget';
import { getVectorDistanceGuides } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getVectorDistanceGuides';

export const updateNudgeVectorDistanceGuide = (state: RootState, canvasRefs: TCanvasRefs, altKey: boolean): void => {
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const isMeasuring = altKey && vectorEditingNodeIds.length > 0 && selectActiveTool(state) === ToolName.move;

  if (isMeasuring) {
    const bakedNodes = getBakedEditingNodes(selectNodes(state), vectorEditingNodeIds);
    const anchor = getAnchor(
      bakedNodes,
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current ?? [],
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current ?? [],
    );

    if (anchor) {
      const target = getTarget(
        bakedNodes,
        anchor.excludeVertexIds,
        canvasRefs.hover.hoveredVectorVertexIdRef.current,
        null,
        null,
        { x: 0, y: 0 },
        getAnchorReferencePoint(anchor),
      );

      if (target) {
        canvasRefs.transform.distanceGuidesRef.current = getVectorDistanceGuides(anchor, target);
      }
    }
  }
};
