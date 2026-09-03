// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLineSizeLabel } from './drawLineSizeLabel';
import { drawRectSizeLabel } from './drawRectSizeLabel';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getSelectionBounds } from '../../../../utils/getSelectionBounds';
import { isSmartSelectionGapHandleActive } from '../../../../utils/isSmartSelectionGapHandleActive';
import { TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';

const getSingleNodeRotation = (node: TSceneNode): number => {
  /* v8 ignore if -- drawSelectionSizeLabel always intercepts a single-line selection via drawLineSizeLabel before this is ever reached, so node is never a line here */
  if (node.type === NodeType.line) {
    return 0;
  }

  return node.rotation;
};

const getSizeLabelRect = (nodes: TSceneNode[]): TSelectionSizeLabelRect => {
  if (nodes.length === 1) {
    return { ...getNodeBounds(nodes[0]), rotation: getSingleNodeRotation(nodes[0]) };
  }

  return { ...getSelectionBounds(nodes), rotation: 0 };
};

export const drawSelectionSizeLabel = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
  editingPathId?: string | null,
): void => {
  const nodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id) && node.id !== editingPathId);
  const [singleNode] = nodes;

  if (isSmartSelectionGapHandleActive(refs)) {
    return;
  }

  if (nodes.length === 1 && singleNode.type === NodeType.line) {
    drawLineSizeLabel(context, singleNode.x1, singleNode.y1, singleNode.x2, singleNode.y2);
  } else if (nodes.length > 0) {
    drawRectSizeLabel(context, getSizeLabelRect(nodes));
  }
};
