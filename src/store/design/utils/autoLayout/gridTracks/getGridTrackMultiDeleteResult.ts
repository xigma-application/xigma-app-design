// types
import { TGridTrackSize } from 'types/design/types';
import { TGridTrackChild, TGridTrackChildDeleteUpdate } from './types';

// utils
import { deleteGridTrack } from './deleteGridTrack';
import { getGridTrackDeleteChildUpdates } from './getGridTrackDeleteChildUpdates';

export type TGridTrackMultiDeleteResult = {
  childUpdates: TGridTrackChildDeleteUpdate[];
  count: number;
  tracks: TGridTrackSize[];
};

export const getGridTrackMultiDeleteResult = (
  tracks: TGridTrackSize[],
  children: TGridTrackChild[],
  removeIndices: number[],
): TGridTrackMultiDeleteResult => {
  const descending = [...new Set(removeIndices)].sort((left, right) => right - left);
  const finalUpdates = new Map<string, TGridTrackChildDeleteUpdate>();
  let workingTracks = tracks;
  let workingChildren = children;

  descending.forEach((removeIndex) => {
    if (removeIndex >= 0 && removeIndex < workingTracks.length && workingTracks.length > 1) {
      getGridTrackDeleteChildUpdates(workingChildren, removeIndex).forEach((update) => {
        finalUpdates.set(update.id, update);
        workingChildren = workingChildren.map((child) =>
          child.id === update.id ? { ...child, anchorIndex: update.anchorIndex, span: update.span ?? 1 } : child,
        );
      });
      workingTracks = deleteGridTrack(workingTracks, removeIndex);
    }
  });

  return { childUpdates: [...finalUpdates.values()], count: workingTracks.length, tracks: workingTracks };
};
