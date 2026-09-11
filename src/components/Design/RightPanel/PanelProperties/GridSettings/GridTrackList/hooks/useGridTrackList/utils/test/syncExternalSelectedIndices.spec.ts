import { RefObject } from 'react';

// types
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { syncExternalSelectedIndices } from '../syncExternalSelectedIndices';

const coordinator = (): TGridTrackSelectionCoordinator => ({
  activeAxis: null,
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
});

const ref = (initial: number[]): RefObject<number[]> => ({ current: initial });

describe('syncExternalSelectedIndices', () => {
  it('should adopt a new external selection, notify the coordinator, and record it on the ref', () => {
    const lastRef = ref([]);
    const setSelection = vi.fn();
    const coord = coordinator();

    syncExternalSelectedIndices('column', coord, [1, 2], lastRef, setSelection);

    expect(coord.onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(setSelection).toHaveBeenCalledWith([1, 2]);
    expect(lastRef.current).toEqual([1, 2]);
  });

  it('should record an external clear on the ref without notifying the coordinator or touching the selection', () => {
    const lastRef = ref([1, 2]);
    const setSelection = vi.fn();
    const coord = coordinator();

    syncExternalSelectedIndices('column', coord, [], lastRef, setSelection);

    expect(coord.onSelectionChange).not.toHaveBeenCalled();
    expect(setSelection).not.toHaveBeenCalled();
    expect(lastRef.current).toEqual([]);
  });

  it('should do nothing when the external selection has the same length and same values as before', () => {
    const lastRef = ref([1, 2]);
    const setSelection = vi.fn();
    const coord = coordinator();

    syncExternalSelectedIndices('column', coord, [1, 2], lastRef, setSelection);

    expect(coord.onSelectionChange).not.toHaveBeenCalled();
    expect(setSelection).not.toHaveBeenCalled();
  });

  it('should treat a same-length but different-content selection as a genuine change', () => {
    const lastRef = ref([1, 2]);
    const setSelection = vi.fn();
    const coord = coordinator();

    syncExternalSelectedIndices('row', coord, [1, 3], lastRef, setSelection);

    expect(coord.onSelectionChange).toHaveBeenCalledWith('row', true);
    expect(setSelection).toHaveBeenCalledWith([1, 3]);
  });
});
