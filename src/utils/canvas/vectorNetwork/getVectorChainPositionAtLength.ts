// types
import { TVectorChainArcLengthSample } from './getVectorChainArcLengthTable';

export type TVectorChainPosition = { segmentId: string; t: number };

export const getVectorChainPositionAtLength = (table: TVectorChainArcLengthSample[], length: number): TVectorChainPosition => {
  const upperIndex = Math.max(
    table.findIndex((sample) => sample.length >= length),
    1,
  );
  const upper = table[upperIndex];
  const lower = table[upperIndex - 1];

  if (lower.segmentId !== upper.segmentId) {
    const span = upper.length - lower.length;
    const ratio = span === 0 ? 0 : (length - lower.length) / span;

    return { segmentId: upper.segmentId, t: upper.t * ratio };
  }

  const span = upper.length - lower.length;
  const ratio = span === 0 ? 0 : (length - lower.length) / span;

  return { segmentId: upper.segmentId, t: lower.t + (upper.t - lower.t) * ratio };
};
