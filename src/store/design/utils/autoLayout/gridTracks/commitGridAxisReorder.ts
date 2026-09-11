// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from './types';

// utils
import { commitGridAxisTracks } from './commitGridAxisTracks';
import { commitGridReorderChildUpdates } from './commitGridReorderChildUpdates';
import { getGridTrackChildren } from './getGridTrackChildren';
import { getGridTrackReorderChildUpdates } from './getGridTrackReorderChildUpdates';
import { isContiguous } from './isContiguous';
import { moveGridTrackBlock } from './moveGridTrackBlock';

export const commitGridAxisReorder = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodes: Record<string, TSceneNode>,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
  sourceIndices: number[],
  targetIndex: number,
): number[] | null => {
  const sorted = [...sourceIndices].sort((left, right) => left - right);
  const move = isContiguous(sorted) ? moveGridTrackBlock(currentTracks, sorted[0], sorted.length, targetIndex) : null;
  const isIdentityMove = move !== null && move.newIndexByOld.every((value, index) => value === index);
  const childResult =
    move !== null && !isIdentityMove ? getGridTrackReorderChildUpdates(getGridTrackChildren(frame, nodes, axis), move.newIndexByOld) : null;

  switch (true) {
    case move === null:
    case isIdentityMove:
    case !childResult!.ok:
      return null;
    default:
      commitGridAxisTracks(dispatch, frame.id, axis, move!.tracks);
      commitGridReorderChildUpdates(dispatch, axis, childResult!.updates);

      return sorted.map((index) => move!.newIndexByOld[index]).sort((left, right) => left - right);
  }
};
