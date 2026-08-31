// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getSelectionBounds } from '../../../../utils/getSelectionBounds';
import { getSelectionSizeLabelPlacement, TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';

const getSingleNodeRotation = (node: TSceneNode): number => (node.type === NodeType.line ? 0 : node.rotation);

const getSizeLabelRect = (nodes: TSceneNode[]): TSelectionSizeLabelRect => {
  if (nodes.length === 1) {
    return { ...getNodeBounds(nodes[0]), rotation: getSingleNodeRotation(nodes[0]) };
  }

  return { ...getSelectionBounds(nodes), rotation: 0 };
};

export const drawSelectionSizeLabel = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  vectorEditingNodeIds: string[],
  editingPathId?: string | null,
): void => {
  const { buffer, gl, imageContext, program, viewport } = context;
  const nodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id) && node.id !== editingPathId);

  if (nodes.length > 0) {
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
