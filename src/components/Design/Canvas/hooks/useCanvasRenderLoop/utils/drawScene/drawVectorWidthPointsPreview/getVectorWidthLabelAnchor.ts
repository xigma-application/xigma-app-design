// types
import { TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';
import { TVectorWidthLabelTarget } from './getVectorWidthLabelTargets';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { getVectorChainPositionAtFraction } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtFraction';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';

export type TVectorWidthLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
  segmentId: string;
  t: number;
};

export const getVectorWidthLabelAnchor = (
  nodes: Record<string, TSceneNode>,
  target: TVectorWidthLabelTarget,
): TVectorWidthLabelAnchor | null => {
  const node = getVectorEditingNode(nodes, target.nodeId);
  const bakedNode = node && getRenderedVectorNode(node);
  const chainOrder = bakedNode && getVectorChainOrder(bakedNode);

  if (!bakedNode || !chainOrder) {
    return null;
  }

  const { segmentId, t } = getVectorChainPositionAtFraction(bakedNode, chainOrder, target.point.position);
  const segment = bakedNode.segments[segmentId];
  const anchorPoint = getVectorSegmentPointAtT(bakedNode, segment, t);
  const normal = getVectorSegmentNormalAtT(bakedNode, segment, t);
  const leftHandle = { x: anchorPoint.x + normal.x * target.point.leftOffset, y: anchorPoint.y + normal.y * target.point.leftOffset };
  const rightHandle = { x: anchorPoint.x - normal.x * target.point.rightOffset, y: anchorPoint.y - normal.y * target.point.rightOffset };

  return {
    anchor: target.side === 'left' ? leftHandle : rightHandle,
    direction: target.side === 'left' ? normal : { x: -normal.x, y: -normal.y },
    segmentId,
    t,
  };
};
