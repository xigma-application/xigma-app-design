// store
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { commitGridAxisTracks } from '../commitGridAxisTracks';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const tracks: TGridTrackSize[] = [{ mode: SizingMode.fill, value: 1 }];

describe('commitGridAxisTracks', () => {
  it('should write the column sizes and count together', () => {
    const dispatch = vi.fn();

    commitGridAxisTracks(dispatch, 'frame-1', 'column', tracks, 4);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnCount: 4, gridColumnSizes: tracks }, id: 'frame-1' });
  });

  it('should write only the column sizes when no count is given', () => {
    const dispatch = vi.fn();

    commitGridAxisTracks(dispatch, 'frame-1', 'column', tracks);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: tracks }, id: 'frame-1' });
  });

  it('should write the row sizes and count together', () => {
    const dispatch = vi.fn();

    commitGridAxisTracks(dispatch, 'frame-1', 'row', tracks, 2);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowCount: 2, gridRowSizes: tracks }, id: 'frame-1' });
  });

  it('should write only the row sizes when no count is given', () => {
    const dispatch = vi.fn();

    commitGridAxisTracks(dispatch, 'frame-1', 'row', tracks);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowSizes: tracks }, id: 'frame-1' });
  });
});
