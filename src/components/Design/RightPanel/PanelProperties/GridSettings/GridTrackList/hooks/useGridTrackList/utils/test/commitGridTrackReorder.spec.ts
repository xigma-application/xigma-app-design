import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { commitGridTrackReorder } from '../commitGridTrackReorder';

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(() => [0, 1]),
  revision: {},
  tracks: [],
  ...overrides,
});

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('commitGridTrackReorder', () => {
  it('should commit the new selection and flag the change as self-made when the reorder resolves', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    const result = commitGridTrackReorder(
      controls({ onReorder: vi.fn(() => [1, 2]) }),
      'column',
      coordinator({ onSelectionChange }),
      isSelfChangeRef,
      setSelection,
      [0, 1],
      2,
    );

    expect(result).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(setSelection).toHaveBeenCalledWith([1, 2]);
    expect(isSelfChangeRef.current).toBe(true);
  });

  it('should leave the selection untouched when the reorder is rejected', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    const result = commitGridTrackReorder(
      controls({ onReorder: vi.fn(() => null) }),
      'column',
      coordinator({ onSelectionChange }),
      isSelfChangeRef,
      setSelection,
      [0, 1],
      2,
    );

    expect(result).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(setSelection).not.toHaveBeenCalled();
    expect(isSelfChangeRef.current).toBe(false);
  });
});
