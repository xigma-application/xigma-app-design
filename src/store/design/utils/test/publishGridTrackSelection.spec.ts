// store
import { setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';

// utils
import { publishGridTrackSelection } from '../publishGridTrackSelection';

describe('publishGridTrackSelection', () => {
  it('should write the same selection to both the canvas-facing and panel-facing fields', () => {
    const dispatch = vi.fn();
    const selection = { axis: 'column' as const, frameId: 'frame-1', indices: [0, 1] };

    publishGridTrackSelection(dispatch, selection);

    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection(selection));
    expect(dispatch).toHaveBeenCalledWith(setPanelGridTrackSelection(selection));
  });

  it('should clear both fields when publishing null', () => {
    const dispatch = vi.fn();

    publishGridTrackSelection(dispatch, null);

    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection(null));
    expect(dispatch).toHaveBeenCalledWith(setPanelGridTrackSelection(null));
  });
});
