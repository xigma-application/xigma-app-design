// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDistanceGuides } from 'components/Design/Canvas/utils/getDistanceGuides/getDistanceGuides';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';

const getActiveRect = (selectedNodes: TSceneNode[]): TDraftRect =>
  selectedNodes.length === 1 ? getRotatedNodeBounds(selectedNodes[0]) : getSelectionBounds(selectedNodes);

export const updateNudgeDistanceGuide = (state: RootState, canvasRefs: TCanvasRefs, altKey: boolean): void => {
  const selectedNodes = selectSelectedNodes(state);
  const hoveredId = canvasRefs.hover.hoverRef.current;
  const hoveredNode = hoveredId ? selectNodes(state)[hoveredId] : undefined;
  const isEligible = altKey && selectedNodes.length > 0 && Boolean(hoveredNode) && !selectedNodes.some((node) => node.id === hoveredId);

  if (isEligible && hoveredNode) {
    canvasRefs.transform.distanceGuidesRef.current = getDistanceGuides(getActiveRect(selectedNodes), getRotatedNodeBounds(hoveredNode));
  }
};
