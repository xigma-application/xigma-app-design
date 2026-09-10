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
  it('should forward the mode change to the controls and flag the change as self-made', () => {
    const onChangeMode = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackModeChange(controls({ onChangeMode }), isSelfChangeRef, 1, 'fixed' as never);

    expect(onChangeMode).toHaveBeenCalledWith(1, 'fixed');
    expect(isSelfChangeRef.current).toBe(true);
  });
});
