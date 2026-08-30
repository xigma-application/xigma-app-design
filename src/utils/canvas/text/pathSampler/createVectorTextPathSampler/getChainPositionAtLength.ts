// types
import { TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';

export const getChainPositionAtLength = (table: TVectorChainArcLengthSample[], length: number): { segmentId: string; t: number } => {
  const upperIndex = Math.max(
    table.findIndex((sample) => sample.length >= length),
    1,
  );
  const upper = table[upperIndex];
  const lower = table[upperIndex - 1];

  if (lower.segmentId !== upper.segmentId) {
    return { segmentId: upper.segmentId, t: upper.t };
  }

  const span = upper.length - lower.length;
  const ratio = span === 0 ? 0 : (length - lower.length) / span;

  return { segmentId: upper.segmentId, t: lower.t + (upper.t - lower.t) * ratio };
};
