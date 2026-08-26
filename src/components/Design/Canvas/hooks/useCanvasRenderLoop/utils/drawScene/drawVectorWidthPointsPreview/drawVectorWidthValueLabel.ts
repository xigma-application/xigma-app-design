// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../../types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder';
import { getVectorChainPositionAtFraction } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtFraction';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';
import { getVectorWidthLabelTargets, type TVectorWidthLabelTarget } from './getVectorWidthLabelTargets';

const drawVectorWidthValueLabelForTarget = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: Record<string, TSceneNode>,
  target: TVectorWidthLabelTarget,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const node = getVectorEditingNode(nodes, target.nodeId);
  const bakedNode = node && getRenderedVectorNode(node);
  const chainOrder = bakedNode && getVectorChainOrder(bakedNode);

  if (bakedNode && chainOrder) {
    const { segmentId, t } = getVectorChainPositionAtFraction(bakedNode, chainOrder, target.point.position);
    const segment = bakedNode.segments[segmentId];
    const anchor = getVectorSegmentPointAtT(bakedNode, segment, t);
    const normal = getVectorSegmentNormalAtT(bakedNode, segment, t);
    const leftHandle = { x: anchor.x + normal.x * target.point.leftOffset, y: anchor.y + normal.y * target.point.leftOffset };
    const rightHandle = { x: anchor.x - normal.x * target.point.rightOffset, y: anchor.y - normal.y * target.point.rightOffset };
    const labelAnchor = target.side === 'left' ? leftHandle : rightHandle;
    const labelDirection = target.side === 'left' ? normal : { x: -normal.x, y: -normal.y };
    const text = String(Math.round(target.point.leftOffset + target.point.rightOffset));

    drawValueLabel(gl, program, buffer, imageContext, text, labelAnchor, labelDirection, canvasWidth, canvasHeight, viewport);
  }
};

export const drawVectorWidthValueLabel = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  getVectorWidthLabelTargets(refs, nodes).forEach((target) =>
    drawVectorWidthValueLabelForTarget(gl, program, buffer, imageContext, nodes, target, canvasWidth, canvasHeight, viewport),
  );
};
