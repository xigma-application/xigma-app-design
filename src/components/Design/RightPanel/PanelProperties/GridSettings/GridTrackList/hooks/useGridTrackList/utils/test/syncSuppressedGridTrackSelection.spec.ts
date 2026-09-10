// utils
import { syncSuppressedGridTrackSelection } from '../syncSuppressedGridTrackSelection';

describe('syncSuppressedGridTrackSelection', () => {
  it('should clear the selection when the axis is suppressed', () => {
    const clearSelection = vi.fn();

    syncSuppressedGridTrackSelection(true, clearSelection);

    expect(clearSelection).toHaveBeenCalled();
  });

  it('should leave the selection untouched when the axis is not suppressed', () => {
    const clearSelection = vi.fn();

    syncSuppressedGridTrackSelection(false, clearSelection);

    expect(clearSelection).not.toHaveBeenCalled();
  });
});
