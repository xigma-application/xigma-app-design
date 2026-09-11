import { RefObject } from 'react';

// hooks
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { commitGridTrackSelect } from '../commitGridTrackSelect';

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  activeAxis: null,
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('commitGridTrackSelect', () => {
  it('should report the selection to the coordinator and select just the given row by default', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: null };

    commitGridTrackSelect('column', coordinator({ onSelectionChange }), anchorRef, setSelection, [], 1, { meta: false, shift: false });

    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(anchorRef.current).toBe(1);
    expect(setSelection).toHaveBeenCalledWith([1]);
  });

  it('should toggle the row into the selection on a meta click', () => {
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: null };

    commitGridTrackSelect('column', coordinator(), anchorRef, setSelection, [0], 2, { meta: true, shift: false });

    expect(anchorRef.current).toBe(2);
    expect(setSelection).toHaveBeenCalledWith([0, 2]);
  });

  it('should toggle the row out of the selection on a meta click when it is already selected', () => {
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: null };

    commitGridTrackSelect('column', coordinator(), anchorRef, setSelection, [0, 2], 2, { meta: true, shift: false });

    expect(setSelection).toHaveBeenCalledWith([0]);
  });

  it('should select the range between the anchor and the given row on a shift click', () => {
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: 0 };

    commitGridTrackSelect('column', coordinator(), anchorRef, setSelection, [0], 2, { meta: false, shift: true });

    expect(setSelection).toHaveBeenCalledWith([0, 1, 2]);
  });

  it('should select just the given row on a shift click when there is no anchor yet', () => {
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: null };

    commitGridTrackSelect('column', coordinator(), anchorRef, setSelection, [], 2, { meta: false, shift: true });

    expect(anchorRef.current).toBe(2);
    expect(setSelection).toHaveBeenCalledWith([2]);
  });
});
