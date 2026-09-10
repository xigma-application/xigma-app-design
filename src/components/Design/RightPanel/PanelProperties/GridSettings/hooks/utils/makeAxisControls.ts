// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';
import { TGridAxisControls, TGridTrackViewModel } from '../types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { addGridTrack } from 'store/design/utils/autoLayout/gridTracks/addGridTrack';
import { commitGridAxisTracks } from './commitGridAxisTracks';
import { commitGridDeleteChildUpdates } from './commitGridDeleteChildUpdates';
import { commitGridReorderChildUpdates } from './commitGridReorderChildUpdates';
import { getGridTrackChildren } from 'store/design/utils/autoLayout/gridTracks/getGridTrackChildren';
import { getGridTrackLinkedIndices } from 'store/design/utils/autoLayout/gridTracks/getGridTrackLinkedIndices';
import { getGridTrackMultiDeleteResult } from 'store/design/utils/autoLayout/gridTracks/getGridTrackMultiDeleteResult';
import { getGridTrackReorderChildUpdates } from 'store/design/utils/autoLayout/gridTracks/getGridTrackReorderChildUpdates';
import { moveGridTrackBlock } from 'store/design/utils/autoLayout/gridTracks/moveGridTrackBlock';

const toViewModels = (tracks: TGridTrackSize[], linkedGroups: number[][]): TGridTrackViewModel[] =>
  tracks.map((track, index) => ({
    index,
    linkedIndices: linkedGroups[index],
    mode: track.mode,
    value: track.value ?? (track.mode === SizingMode.fill ? 1 : 0),
  }));

const isContiguous = (values: number[]): boolean => values.every((value, index) => index === 0 || value === values[index - 1] + 1);

export const makeAxisControls = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodes: Record<string, TSceneNode>,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
): TGridAxisControls => ({
  onAdd: (): void => {
    const next = addGridTrack(currentTracks);
    commitGridAxisTracks(dispatch, frame.id, axis, next, next.length);
  },
  onChangeMode: (index: number, mode: SizingMode): void => {
    const next = currentTracks.map((track, trackIndex) =>
      trackIndex === index ? { mode, value: mode === SizingMode.fill ? 1 : (track.value ?? 0) } : track,
    );
    commitGridAxisTracks(dispatch, frame.id, axis, next);
  },
  onChangeValue: (index: number, value: number): void => {
    const next = currentTracks.map((track, trackIndex) => (trackIndex === index ? { ...track, value: Math.max(value, 0) } : track));
    commitGridAxisTracks(dispatch, frame.id, axis, next);
  },
  onDelete: (indices: number[]): void => {
    const result = getGridTrackMultiDeleteResult(currentTracks, getGridTrackChildren(frame, nodes, axis), indices);

    if (result.count < currentTracks.length) {
      commitGridAxisTracks(dispatch, frame.id, axis, result.tracks, result.count);
      commitGridDeleteChildUpdates(dispatch, axis, result.childUpdates);
    }
  },
  onReorder: (sourceIndices: number[], targetIndex: number): number[] | null => {
    const sorted = [...sourceIndices].sort((left, right) => left - right);
    const move = isContiguous(sorted) ? moveGridTrackBlock(currentTracks, sorted[0], sorted.length, targetIndex) : null;
    const isIdentityMove = move !== null && move.newIndexByOld.every((value, index) => value === index);
    const childResult =
      move !== null && !isIdentityMove
        ? getGridTrackReorderChildUpdates(getGridTrackChildren(frame, nodes, axis), move.newIndexByOld)
        : null;

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
  },
  revision: frame,
  tracks: toViewModels(currentTracks, getGridTrackLinkedIndices(getGridTrackChildren(frame, nodes, axis), currentTracks.length)),
});
