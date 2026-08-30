// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorWidthPoint } from 'types/design/types';
import { TVectorWidthPointDragTarget } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { getVectorChainPositionAtFraction } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtFraction';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';

export type TVectorWidthPointHandleHit = {
  angle: number;
  nodeId: string;
  point: TVectorWidthPoint;
  segmentId: string;
  t: number;
  target: TVectorWidthPointDragTarget;
};

const getWidthPointTargets = (
  nodeId: string,
  bakedNode: TVectorNode,
  widthPoint: TVectorWidthPoint,
): { hit: TVectorWidthPointHandleHit; point: TPoint }[] => {
  const chainOrder = getVectorChainOrder(bakedNode)!;
  const { segmentId, t } = getVectorChainPositionAtFraction(bakedNode, chainOrder, widthPoint.position);
  const segment = bakedNode.segments[segmentId];
  const anchor = getVectorSegmentPointAtT(bakedNode, segment, t);
  const normal = getVectorSegmentNormalAtT(bakedNode, segment, t);
  const angle = getAngleBetweenPoints({ x: 0, y: 0 }, normal);
  const leftHandle = { x: anchor.x + normal.x * widthPoint.leftOffset, y: anchor.y + normal.y * widthPoint.leftOffset };
  const rightHandle = { x: anchor.x - normal.x * widthPoint.rightOffset, y: anchor.y - normal.y * widthPoint.rightOffset };

  return [
    { hit: { angle, nodeId, point: widthPoint, segmentId, t, target: 'point' }, point: anchor },
    { hit: { angle, nodeId, point: widthPoint, segmentId, t, target: 'left' }, point: leftHandle },
    { hit: { angle, nodeId, point: widthPoint, segmentId, t, target: 'right' }, point: rightHandle },
  ];
};

export const getVectorWidthPointHandleAtPoint = (
  point: TPoint,
  nodes: TVectorNode[],
  tolerance: number,
): TVectorWidthPointHandleHit | null => {
  const hits = nodes
    .flatMap((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };

      return Object.values(node.widthProfile?.points ?? {}).flatMap((widthPoint) => getWidthPointTargets(node.id, bakedNode, widthPoint));
    })
    .map(({ hit, point: targetPoint }) => ({ distance: Math.hypot(point.x - targetPoint.x, point.y - targetPoint.y), hit }))
    .filter(({ distance }) => distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return hits[0]?.hit ?? null;
};
