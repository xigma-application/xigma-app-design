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
import { commitGridAxisModeChange } from './commitGridAxisModeChange';
import { commitGridAxisReorder } from './commitGridAxisReorder';
import { commitGridAxisValueChange } from './commitGridAxisValueChange';
import { getGridTrackChildren } from 'store/design/utils/autoLayout/gridTracks/getGridTrackChildren';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
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
  onChangeMode: (index: number, mode: SizingMode): void => commitGridAxisModeChange(dispatch, frame, axis, currentTracks, index, mode),
  onChangeValue: (index: number, value: number): void => commitGridAxisValueChange(dispatch, frame, axis, currentTracks, index, value),
  onDelete: (indices: number[]): void => commitGridAxisDelete(dispatch, frame, nodes, axis, currentTracks, indices),
  onReorder: (sourceIndices: number[], targetIndex: number): number[] | null =>
    commitGridAxisReorder(dispatch, frame, nodes, axis, currentTracks, sourceIndices, targetIndex),
  revision: frame,
  tracks: toViewModels(
    currentTracks,
    getGridTrackLinkedIndices(getGridTrackChildren(frame, nodes, axis), currentTracks.length),
    axis === 'column' ? getGridTrackLayout(frame, nodes).columnSize : getGridTrackLayout(frame, nodes).rowSize,
  ),
});
