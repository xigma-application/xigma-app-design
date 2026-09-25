// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { drawLineSizeLabel } from './drawLineSizeLabel';
import { drawRectSizeLabel } from './drawRectSizeLabel';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getSizeLabelSizingModes } from './getSizeLabelSizingModes';
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';
import { getSelectionBounds } from '../../../../utils/getSelectionBounds';
import { getSelectionGroups } from '../../../../utils/getSelectionGroups';
import { isSmartSelectionGapHandleActive } from '../../../../utils/isSmartSelectionGapHandleActive';
import { isSmartSelectionSwapDragActive } from '../../../../utils/isSmartSelectionSwapDragActive';
import { TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';

const getSizeLabelRect = (nodes: TSceneNode[]): TSelectionSizeLabelRect => {
  if (nodes.length === 1) {
    return { ...getNodeBounds(nodes[0]), paddings: getStrokePaddings(nodes[0]), rotation: nodes[0].rotation };
  }

  return { ...getSelectionBounds(nodes), rotation: 0 };
};

const drawGroupSizeLabel = (context: TDrawSceneContext, nodes: TSceneNode[]): void => {
  const [singleNode] = nodes;

  if (nodes.length === 1 && singleNode.type === NodeType.line) {
    const { x1, x2, y1, y2 } = getLinePoints(singleNode);
    drawLineSizeLabel(context, x1, y1, x2, y2);
  } else {
    const sizingModes = nodes.length === 1 ? getSizeLabelSizingModes(singleNode) : undefined;

    drawRectSizeLabel(context, getSizeLabelRect(nodes), sizingModes);
  }
};

export const drawSelectionSizeLabel = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
  editingPathId?: string | null,
): void => {
  const nodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id) && node.id !== editingPathId);

  if (!isSmartSelectionGapHandleActive(refs) && !isSmartSelectionSwapDragActive(refs)) {
    getSelectionGroups(nodes).forEach((group) => drawGroupSizeLabel(context, group));
  }
};
