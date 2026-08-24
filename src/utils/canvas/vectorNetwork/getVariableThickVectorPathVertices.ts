// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVariableThickPolylineVertices } from './getVariableThickPolylineVertices';
import { getVectorChainArcLengthTable } from './getVectorChainArcLengthTable';
import { getVectorChainOrder, TVectorChainOrder } from './getVectorChainOrder';
import { getVectorChainPositionAtFraction } from './getVectorChainPositionAtFraction';
import { getVectorSegmentPointAtT } from './getVectorSegmentPointAtT';
import { getVectorWidthOffsetsAtChainPosition } from './getVectorWidthOffsetsAtChainPosition';

const getExplicitPointSegmentTs = (node: TVectorNode, chainOrder: TVectorChainOrder): Record<string, number[]> => {
  const explicitPoints = Object.values(node.widthProfile?.points ?? {});

  return explicitPoints.reduce<Record<string, number[]>>((extraSegmentTs, point) => {
    const { segmentId, t } = getVectorChainPositionAtFraction(node, chainOrder, point.position);

    return { ...extraSegmentTs, [segmentId]: [...(extraSegmentTs[segmentId] ?? []), t] };
  }, {});
};

const collectChainSamples = (
  node: TVectorNode,
  chainOrder: TVectorChainOrder,
): { chainPoints: TPoint[]; leftOffsets: number[]; rightOffsets: number[] } => {
  const table = getVectorChainArcLengthTable(node, chainOrder, getExplicitPointSegmentTs(node, chainOrder));
  const totalLength = table[table.length - 1].length;
  const chainPoints: TPoint[] = [];
  const leftOffsets: number[] = [];
  const rightOffsets: number[] = [];

  table.forEach((sample) => {
    const fraction = totalLength === 0 ? 0 : sample.length / totalLength;
    const offsets = getVectorWidthOffsetsAtChainPosition(node, fraction);

    chainPoints.push(getVectorSegmentPointAtT(node, node.segments[sample.segmentId], sample.t));
    leftOffsets.push(offsets.leftOffset);
    rightOffsets.push(offsets.rightOffset);
  });

  return { chainPoints, leftOffsets, rightOffsets };
};

export const getVariableThickVectorPathVertices = (node: TVectorNode): number[] => {
  const chainOrder = getVectorChainOrder(node)!;
  const { chainPoints, leftOffsets, rightOffsets } = collectChainSamples(node, chainOrder);

  if (chainOrder.isClosed) {
    chainPoints.push(chainPoints[0]);
    leftOffsets.push(leftOffsets[0]);
    rightOffsets.push(rightOffsets[0]);
  }

  return getVariableThickPolylineVertices(chainPoints, leftOffsets, rightOffsets);
};
