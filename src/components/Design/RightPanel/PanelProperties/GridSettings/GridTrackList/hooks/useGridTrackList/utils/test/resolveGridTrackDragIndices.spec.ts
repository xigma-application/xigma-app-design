// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { resolveGridTrackDragIndices } from '../resolveGridTrackDragIndices';

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(),
  revision: {},
  tracks: [
    { index: 0, linkedIndices: [0, 1], mode: 'fill', value: 1 },
    { index: 1, linkedIndices: [0, 1], mode: 'fill', value: 1 },
    { index: 2, linkedIndices: [2], mode: 'fill', value: 1 },
  ] as TGridAxisControls['tracks'],
  ...overrides,
});

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('resolveGridTrackDragIndices', () => {
  it('should reuse the current selection when the grabbed row is already part of it', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackDragIndices(controls(), 'column', coordinator({ onSelectionChange }), setSelection, [0, 1], 1);

    expect(result).toEqual([0, 1]);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(setSelection).not.toHaveBeenCalled();
  });

  it('should select the grabbed row plus its linked tracks when it is outside the current selection', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackDragIndices(controls(), 'column', coordinator({ onSelectionChange }), setSelection, [], 0);

    expect(result).toEqual([0, 1]);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(setSelection).toHaveBeenCalledWith([0, 1]);
  });

  it('should fall back to just the grabbed row when it has no linked tracks', () => {
    const setSelection = vi.fn();

    const result = resolveGridTrackDragIndices(controls(), 'column', coordinator(), setSelection, [], 2);

    expect(result).toEqual([2]);
  });
});
