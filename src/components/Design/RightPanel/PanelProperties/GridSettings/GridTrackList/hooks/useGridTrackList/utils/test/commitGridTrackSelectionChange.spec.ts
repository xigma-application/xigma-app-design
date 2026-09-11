// utils
import { commitGridTrackSelectionChange } from '../commitGridTrackSelectionChange';

vi.mock('store/design/utils/publishGridTrackSelection', () => ({
  publishGridTrackSelection: vi.fn(),
}));

describe('commitGridTrackSelectionChange', () => {
  it('should update the local indices and do nothing else when there is no frame id', async () => {
    const { publishGridTrackSelection } = await import('store/design/utils/publishGridTrackSelection');
    const setLocalIndices = vi.fn();

    commitGridTrackSelectionChange(vi.fn(), 'column', null, setLocalIndices, [0, 1]);

    expect(setLocalIndices).toHaveBeenCalledWith([0, 1]);
    expect(publishGridTrackSelection).not.toHaveBeenCalled();
  });

  it('should publish the selection to the store when there is a frame id', async () => {
    const { publishGridTrackSelection } = await import('store/design/utils/publishGridTrackSelection');
    const dispatch = vi.fn();
    const setLocalIndices = vi.fn();

    commitGridTrackSelectionChange(dispatch, 'row', 'frame-1', setLocalIndices, [0, 1]);

    expect(publishGridTrackSelection).toHaveBeenCalledWith(dispatch, { axis: 'row', frameId: 'frame-1', indices: [0, 1] });
  });

  it('should publish null when clearing the selection of a frame', async () => {
    const { publishGridTrackSelection } = await import('store/design/utils/publishGridTrackSelection');
    const dispatch = vi.fn();
    const setLocalIndices = vi.fn();

    commitGridTrackSelectionChange(dispatch, 'row', 'frame-1', setLocalIndices, []);

    expect(publishGridTrackSelection).toHaveBeenCalledWith(dispatch, null);
  });
});
