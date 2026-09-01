// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getLineSizeLabelPlacement } from './getLineSizeLabelPlacement';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getSelectionBounds } from '../../../../utils/getSelectionBounds';
import { getSelectionSizeLabelPlacement, TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';

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

const drawLineSizeLabel = (context: TDrawSceneContext, node: TLineNode): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, angleDeg, offsetDirection } = getLineSizeLabelPlacement(node.x1, node.y1, node.x2, node.y2);
  const length = Math.hypot(node.x2 - node.x1, node.y2 - node.y1);
  const text = `${Math.round(length)} x 0`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, offsetDirection, canvasWidth, canvasHeight, viewport, {
    angleDeg,
    edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
    fill: DRAFT_FRAME_STROKE,
  });
};

export const drawSelectionSizeLabel = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  editingPathId?: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const nodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id) && node.id !== editingPathId);
  const [singleNode] = nodes;

  if (nodes.length === 1 && singleNode.type === NodeType.line) {
    drawLineSizeLabel(context, singleNode);
  } else if (nodes.length > 0) {
    const rect = getSizeLabelRect(nodes);
    const { anchor, angleDeg, offsetDirection } = getSelectionSizeLabelPlacement(rect);
    const text = `${Math.round(rect.width)} x ${Math.round(rect.height)}`;

    drawValueLabel(gl, program, buffer, imageContext, text, anchor, offsetDirection, canvasWidth, canvasHeight, viewport, {
      angleDeg,
      edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
      fill: DRAFT_FRAME_STROKE,
    });
  }
};
