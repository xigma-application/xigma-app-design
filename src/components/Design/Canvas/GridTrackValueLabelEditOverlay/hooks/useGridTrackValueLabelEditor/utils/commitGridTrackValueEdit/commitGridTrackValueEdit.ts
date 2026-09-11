// store
import { AppDispatch, RootState } from 'store';
import { selectGridTrackSelection, selectNodes } from 'store/design/selectors';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { buildGridTrackList } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { commitFillTrackEdit } from './commitFillTrackEdit';
import { commitFixedTrackEdit } from './commitFixedTrackEdit';
import { commitHugTrackEdit } from './commitHugTrackEdit';
import { getGridTrackEditTrackCount } from './getGridTrackEditTrackCount';

export const commitGridTrackValueEdit = (dispatch: AppDispatch, state: RootState, edit: TGridTrackValueEditTarget, raw: string): void => {
  const nodes = selectNodes(state);
  const frame = nodes[edit.frameId];

  if (frame && frame.type === NodeType.frame) {
    const trackCount = getGridTrackEditTrackCount(frame, nodes, edit.axis);
    const providedSizes = edit.axis === 'column' ? frame.gridColumnSizes : frame.gridRowSizes;
    const currentTracks = buildGridTrackList(trackCount, providedSizes);
    const track = currentTracks[edit.index];

    if (track) {
      const selection = selectGridTrackSelection(state);
      const selectedIndices = selection?.frameId === edit.frameId && selection.axis === edit.axis ? selection.indices : [];
      const indices = selectedIndices.includes(edit.index) ? selectedIndices : [edit.index];

      switch (track.mode) {
        case SizingMode.fill:
          commitFillTrackEdit(dispatch, frame, edit, currentTracks, indices, raw);
          break;
        case SizingMode.hug:
          commitHugTrackEdit(dispatch, frame, edit, currentTracks, indices, raw);
          break;
        default:
          commitFixedTrackEdit(dispatch, frame, edit, currentTracks, indices, raw);
      }
    }
  }
};
