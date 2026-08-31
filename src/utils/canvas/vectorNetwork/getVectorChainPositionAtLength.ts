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

    // `upper` is the first recorded sample past the shared vertex, but the vertex itself was never
    // recorded (see getVectorChainArcLengthTable's entryIndex>0 dedupe) — so its implicit t on this
    // segment isn't always 0: a segment walked in reverse (chain order flips it to stay continuous)
    // starts from t=1 instead. That implicit start is always the opposite of the segment's own
    // final t, which every entry ends on exactly (evenTs always spans the full [0,1] range).
    let finishIndex = upperIndex;

    while (finishIndex + 1 < table.length && table[finishIndex + 1].segmentId === upper.segmentId) {
      finishIndex += 1;
    }

    const startT = 1 - table[finishIndex].t;

    return { segmentId: upper.segmentId, t: startT + (upper.t - startT) * ratio };
  }

  const span = upper.length - lower.length;
  const ratio = span === 0 ? 0 : (length - lower.length) / span;

  return { segmentId: upper.segmentId, t: lower.t + (upper.t - lower.t) * ratio };
};
