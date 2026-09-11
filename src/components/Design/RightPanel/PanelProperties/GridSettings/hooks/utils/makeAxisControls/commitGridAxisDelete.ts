// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { commitGridAxisTracks } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisTracks';
import { commitGridDeleteChildUpdates } from '../commitGridDeleteChildUpdates';
import { commitGridLayoutExit } from '../commitGridLayoutExit';
import { getGridTrackChildren } from 'store/design/utils/autoLayout/gridTracks/getGridTrackChildren';
import { getGridTrackMultiDeleteResult } from 'store/design/utils/autoLayout/gridTracks/getGridTrackMultiDeleteResult';

export const commitGridAxisDelete = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodes: Record<string, TSceneNode>,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
  indices: number[],
): void => {
  const uniqueValidIndices = new Set(indices.filter((index) => index >= 0 && index < currentTracks.length));

  if (uniqueValidIndices.size >= currentTracks.length) {
    commitGridLayoutExit(dispatch, frame, nodes);
  } else {
    const result = getGridTrackMultiDeleteResult(currentTracks, getGridTrackChildren(frame, nodes, axis), indices);

    if (result.count < currentTracks.length) {
      commitGridAxisTracks(dispatch, frame.id, axis, result.tracks, result.count);
      commitGridDeleteChildUpdates(dispatch, axis, result.childUpdates);
    }
  }
};
