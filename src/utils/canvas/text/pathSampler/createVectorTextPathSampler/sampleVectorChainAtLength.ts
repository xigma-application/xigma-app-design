// types
import { TChainSampleData } from './getChainSampleData';
import { TPathSample } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';
import { getVectorChainPositionAtLength } from '../../../vectorNetwork/getVectorChainPositionAtLength';
import { getVectorSegmentNormalAtT } from '../../../vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from '../../../vectorNetwork/getVectorSegmentPointAtT';

const wrapOrClampLength = (length: number, totalLength: number, isClosed: boolean): number =>
  isClosed ? ((length % totalLength) + totalLength) % totalLength : clamp(length, 0, totalLength);

export const sampleVectorChainAtLength = (center: TPoint, data: TChainSampleData, length: number): TPathSample => {
  const { chainOrder, rendered, table } = data;
  const totalLength = table[table.length - 1].length;

  if (totalLength === 0) {
    return { angleDegrees: 0, x: 0, y: 0 };
  }

  const wrapped = wrapOrClampLength(length, totalLength, chainOrder.isClosed);
  const { segmentId, t } = getVectorChainPositionAtLength(table, wrapped);
  const segment = rendered.segments[segmentId];
  const world = getVectorSegmentPointAtT(rendered, segment, t);
  const normal = getVectorSegmentNormalAtT(rendered, segment, t);
  const rawAngleDegrees = (Math.atan2(-normal.x, normal.y) * 180) / Math.PI;
  const walkedReversed = chainOrder.entries.some((entry) => entry.segmentId === segmentId && entry.reversed);

  return {
    angleDegrees: walkedReversed ? rawAngleDegrees + 180 : rawAngleDegrees,
    x: world.x - center.x,
    y: world.y - center.y,
  };
};
