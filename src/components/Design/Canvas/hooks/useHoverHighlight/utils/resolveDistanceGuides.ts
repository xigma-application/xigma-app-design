// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDistanceGuides } from '../../../utils/getDistanceGuides/getDistanceGuides';
import { getRotatedNodeBounds } from '../../../utils/getRotatedNodeBounds';
import { getSelectionBounds } from '../../../utils/getSelectionBounds';

const getActiveRect = (selectedNodes: TSceneNode[]): TDraftRect =>
  selectedNodes.length === 1 ? getRotatedNodeBounds(selectedNodes[0]) : getSelectionBounds(selectedNodes);

export const resolveDistanceGuides = (
  event: PointerEvent,
  activeTool: ToolName,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const selectedNodes = selectSelectedNodes(state);
  const hoveredId = canvasRefs.hover.hoverRef.current;
  const hoveredNode = hoveredId ? selectNodes(state)[hoveredId] : undefined;
  const isEligible =
    activeTool === ToolName.default &&
    event.altKey &&
    selectedNodes.length > 0 &&
    Boolean(hoveredNode) &&
    !selectedNodes.some((node) => node.id === hoveredId);

  if (isEligible && hoveredNode) {
    canvasRefs.transform.distanceGuidesRef.current = getDistanceGuides(getActiveRect(selectedNodes), getRotatedNodeBounds(hoveredNode));
    setClassName('distance-measure');
  } else {
    canvasRefs.transform.distanceGuidesRef.current = null;
  }
};
