import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { commitGridTrackDelete } from '../commitGridTrackDelete';

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

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('commitGridTrackDelete', () => {
  it('should delete the whole selection when the given row is part of it, then clear it', () => {
    const onDelete = vi.fn();
    const onSelectionChange = vi.fn();
    const clearSelection = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackDelete(controls({ onDelete }), 'column', coordinator({ onSelectionChange }), isSelfChangeRef, clearSelection, [0, 1], 1);

    expect(onDelete).toHaveBeenCalledWith([0, 1]);
    expect(isSelfChangeRef.current).toBe(true);
    expect(clearSelection).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith('column', false);
  });

  it('should delete just the given row when it is outside the selection', () => {
    const onDelete = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: false };

    commitGridTrackDelete(controls({ onDelete }), 'column', coordinator(), isSelfChangeRef, vi.fn(), [0], 2);

    expect(onDelete).toHaveBeenCalledWith([2]);
  });
});
