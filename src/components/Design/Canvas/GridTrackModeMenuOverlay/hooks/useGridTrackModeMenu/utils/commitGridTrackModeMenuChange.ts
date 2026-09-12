// store
import { AppDispatch, RootState } from 'store';
import { selectGridTrackSelection, selectNodes } from 'store/design/selectors';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackModeMenuTarget } from 'utils/canvas/gridSlots/getGridTrackModeMenuTarget';

// utils
import { buildGridTrackList } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { commitGridAxisModeChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisModeChange';
import { getGridAxisTrackCount } from 'store/design/utils/autoLayout/gridTracks/getGridAxisTrackCount';
import { roundTrackSize } from 'store/design/utils/autoLayout/gridTracks/roundTrackSize';

export const commitGridTrackModeMenuChange = (
  dispatch: AppDispatch,
  state: RootState,
  target: TGridTrackModeMenuTarget,
  mode: SizingMode,
): void => {
  const nodes = selectNodes(state);
  const frame = nodes[target.frameId];

  if (frame && frame.type === NodeType.frame) {
    const trackCount = getGridAxisTrackCount(frame, nodes, target.axis);
    const providedSizes = target.axis === 'column' ? frame.gridColumnSizes : frame.gridRowSizes;
    const currentTracks = buildGridTrackList(trackCount, providedSizes);
    const selection = selectGridTrackSelection(state);
    const selectedIndices = selection?.frameId === target.frameId && selection.axis === target.axis ? selection.indices : [];
    const indices = selectedIndices.includes(target.index) ? selectedIndices : [target.index];
    const value = mode === SizingMode.fixed ? roundTrackSize(target.resolvedSize) : undefined;

    commitGridAxisModeChange(dispatch, frame, target.axis, currentTracks, indices, mode, value);
  }
};
