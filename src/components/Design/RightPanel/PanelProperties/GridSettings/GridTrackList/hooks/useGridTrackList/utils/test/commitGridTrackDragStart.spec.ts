import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { commitGridTrackDragStart } from '../commitGridTrackDragStart';

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

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

describe('commitGridTrackDragStart', () => {
  it('should begin the drag with the current selection when the grabbed row is already part of it', () => {
    const setSelection = vi.fn();
    const beginDrag = vi.fn();
    const event = pointerEvent();

    commitGridTrackDragStart(controls(), 'column', coordinator(), setSelection, [0, 1], beginDrag, 1, event);

    expect(setSelection).not.toHaveBeenCalled();
    expect(beginDrag).toHaveBeenCalledWith([0, 1], 1, event);
  });

  it('should select the grabbed row plus its linked tracks and begin the drag with them', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();
    const beginDrag = vi.fn();
    const event = pointerEvent();

    commitGridTrackDragStart(controls(), 'column', coordinator({ onSelectionChange }), setSelection, [], beginDrag, 0, event);

    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(setSelection).toHaveBeenCalledWith([0, 1]);
    expect(beginDrag).toHaveBeenCalledWith([0, 1], 0, event);
  });
});
