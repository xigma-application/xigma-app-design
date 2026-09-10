import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';

// utils
import { commitGridTrackAdd } from '../commitGridTrackAdd';

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

describe('commitGridTrackAdd', () => {
  it('should forward the add to the controls and flag the change as self-made', () => {
    const onAdd = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackAdd(controls({ onAdd }), isSelfChangeRef);

    expect(onAdd).toHaveBeenCalled();
    expect(isSelfChangeRef.current).toBe(true);
  });
});
