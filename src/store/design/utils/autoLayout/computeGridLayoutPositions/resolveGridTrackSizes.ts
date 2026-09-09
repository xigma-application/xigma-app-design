// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

export const resolveGridTrackSizes = (
  tracks: TGridTrackSize[],
  available: number,
  gap: number,
  isFrameAxisHug: boolean,
  contentMaxPerTrack: number[],
): number[] => {
  if (tracks.length === 0) {
    return [];
  }

  const reservedPerTrack = tracks.map((track, index) => {
    if (track.mode === SizingMode.fixed) {
      return Math.max(track.value ?? 0, 0);
    }

    if (track.mode === SizingMode.hug) {
      return Math.max(contentMaxPerTrack[index] ?? 0, 0);
    }

    return null;
  });
  const fillWeights = tracks.map((track) => (track.mode === SizingMode.fill ? Math.max(track.value ?? 1, 0) : 0));
  const reservedSum = reservedPerTrack.reduce<number>((total, size) => total + (size ?? 0), 0);
  const totalWeight = fillWeights.reduce((total, weight) => total + weight, 0);
  const freeSpace = Math.max(available - reservedSum - gap * (tracks.length - 1), 0);

  return tracks.map((_track, index) => {
    if (reservedPerTrack[index] !== null) {
      return reservedPerTrack[index] as number;
    }

    if (isFrameAxisHug || totalWeight === 0) {
      return Math.max(contentMaxPerTrack[index] ?? 0, 0);
    }

    return (freeSpace * fillWeights[index]) / totalWeight;
  });
};
