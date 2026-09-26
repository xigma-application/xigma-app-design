// types
import { TPaint } from 'types/design/paint/types';

// utils
import { withPaintsOpacity } from 'utils/design/paint/withPaintsOpacity';

export const withSnapshotFacesOpacity = <TSnapshot extends { facesByPaint: { paint: TPaint[] }[] }>(
  snapshot: TSnapshot,
  alpha: number,
): TSnapshot =>
  alpha === 1
    ? snapshot
    : { ...snapshot, facesByPaint: snapshot.facesByPaint.map((face) => ({ ...face, paint: withPaintsOpacity(face.paint, alpha) })) };
