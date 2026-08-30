// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel';
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
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  vectorEditingNodeIds: string[],
): void => {
  const nodes = selectedNodes.filter((node) => !vectorEditingNodeIds.includes(node.id));

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
