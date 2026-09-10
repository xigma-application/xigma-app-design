import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';

// utils
import { commitGridTrackValueChange } from '../commitGridTrackValueChange';

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(),
  revision: {},
  tracks: [],
  ...overrides,
});

describe('commitGridTrackValueChange', () => {
  it('should apply the value change to just this row when it is outside the selection, and flag the change as self-made', () => {
    const onChangeValue = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackValueChange(controls({ onChangeValue }), isSelfChangeRef, [0], 1, 40);

    expect(onChangeValue).toHaveBeenCalledWith([1], 1, 40);
    expect(isSelfChangeRef.current).toBe(true);
  });

  it('should apply the value change to the whole selection when the given row is part of it', () => {
    const onChangeValue = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackValueChange(controls({ onChangeValue }), isSelfChangeRef, [0, 1, 2], 1, 40);

    expect(onChangeValue).toHaveBeenCalledWith([0, 1, 2], 1, 40);
  });
});
