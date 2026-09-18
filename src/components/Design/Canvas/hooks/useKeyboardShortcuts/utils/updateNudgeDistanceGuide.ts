// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDistanceGuides } from 'components/Design/Canvas/utils/getDistanceGuides/getDistanceGuides';
import { getStrokedRotatedNodeBounds } from 'components/Design/Canvas/utils/getStrokedRotatedNodeBounds';
import { getStrokedSelectionBounds } from 'components/Design/Canvas/utils/getStrokedSelectionBounds';

const getActiveRect = (selectedNodes: TSceneNode[]): TDraftRect =>
  selectedNodes.length === 1 ? getStrokedRotatedNodeBounds(selectedNodes[0]) : getStrokedSelectionBounds(selectedNodes);

export const updateNudgeDistanceGuide = (state: RootState, canvasRefs: TCanvasRefs, altKey: boolean): void => {
  const selectedNodes = selectSelectedNodes(state);
  const hoveredId = canvasRefs.hover.hoverRef.current;
  const hoveredNode = hoveredId ? selectNodes(state)[hoveredId] : undefined;
  const isEligible = altKey && selectedNodes.length > 0 && Boolean(hoveredNode) && !selectedNodes.some((node) => node.id === hoveredId);

  if (isEligible && hoveredNode) {
    canvasRefs.transform.distanceGuidesRef.current = getDistanceGuides(
      getActiveRect(selectedNodes),
      getStrokedRotatedNodeBounds(hoveredNode),
    );
  }
};
