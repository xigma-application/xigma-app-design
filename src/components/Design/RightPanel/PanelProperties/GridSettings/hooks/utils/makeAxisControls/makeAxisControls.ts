// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';
import { TGridAxisControls } from '../../types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { commitGridAxisAdd } from './commitGridAxisAdd';
import { commitGridAxisDelete } from './commitGridAxisDelete';
import { commitGridAxisModeChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisModeChange';
import { commitGridAxisReorder } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisReorder';
import { commitGridAxisValueChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisValueChange';
import { getGridResolvedTrackSizes } from 'store/design/utils/autoLayout/getGridResolvedTrackSizes';
import { getGridTrackChildren } from 'store/design/utils/autoLayout/gridTracks/getGridTrackChildren';
import { getGridTrackLinkedIndices } from 'store/design/utils/autoLayout/gridTracks/getGridTrackLinkedIndices';
import { toViewModels } from './toViewModels';

export const makeAxisControls = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodes: Record<string, TSceneNode>,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
): TGridAxisControls => ({
  onAdd: (): void => commitGridAxisAdd(dispatch, frame, axis, currentTracks),
  onChangeMode: (indices: number[], mode: SizingMode, value?: number): void =>
    commitGridAxisModeChange(dispatch, frame, axis, currentTracks, indices, mode, value),
  onChangeValue: (indices: number[], triggerIndex: number, value: number): void =>
    commitGridAxisValueChange(dispatch, frame, axis, currentTracks, indices, triggerIndex, value),
  onDelete: (indices: number[]): void => commitGridAxisDelete(dispatch, frame, nodes, axis, currentTracks, indices),
  onReorder: (sourceIndices: number[], targetIndex: number): number[] | null =>
    commitGridAxisReorder(dispatch, frame, nodes, axis, currentTracks, sourceIndices, targetIndex),
  revision: frame,
  tracks: toViewModels(
    currentTracks,
    getGridTrackLinkedIndices(getGridTrackChildren(frame, nodes, axis), currentTracks.length),
    getGridResolvedTrackSizes(frame, nodes)[axis],
  ),
});
