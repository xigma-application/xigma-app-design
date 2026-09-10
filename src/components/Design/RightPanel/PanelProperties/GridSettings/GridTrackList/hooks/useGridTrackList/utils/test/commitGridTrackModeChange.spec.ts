import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';

// utils
import { commitGridTrackModeChange } from '../commitGridTrackModeChange';

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

describe('commitGridTrackModeChange', () => {
  it('should apply the mode change to just this row when it is outside the selection, and flag the change as self-made', () => {
    const onChangeMode = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackModeChange(controls({ onChangeMode }), isSelfChangeRef, [0], 1, 'fixed' as never);

    expect(onChangeMode).toHaveBeenCalledWith([1], 'fixed', undefined);
    expect(isSelfChangeRef.current).toBe(true);
  });

  it('should apply the mode change to the whole selection when the given row is part of it', () => {
    const onChangeMode = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackModeChange(controls({ onChangeMode }), isSelfChangeRef, [0, 1, 2], 1, 'fixed' as never, 240);

    expect(onChangeMode).toHaveBeenCalledWith([0, 1, 2], 'fixed', 240);
  });
});
