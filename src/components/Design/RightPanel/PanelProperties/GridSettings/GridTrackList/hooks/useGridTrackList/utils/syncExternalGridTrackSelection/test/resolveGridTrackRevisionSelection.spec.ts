// hooks
import { TGridTrackSelectionCoordinator } from '../../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { resolveGridTrackRevisionSelection } from '../resolveGridTrackRevisionSelection';

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  activeAxis: null,
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('resolveGridTrackRevisionSelection', () => {
  it('should restore a previously recorded selection and notify the coordinator', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackRevisionSelection(
      'column',
      coordinator({ onSelectionChange }),
      { current: false },
      { current: [0] },
      [1],
      [0, 1],
      setSelection,
    );

    expect(result).toEqual([0, 1]);
    expect(setSelection).toHaveBeenCalledWith([0, 1]);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
  });

  it('should release the axis when the restored selection is empty', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackRevisionSelection(
      'row',
      coordinator({ onSelectionChange }),
      { current: false },
      { current: [] },
      [1],
      [],
      setSelection,
    );

    expect(result).toEqual([]);
    expect(onSelectionChange).toHaveBeenCalledWith('row', false);
  });

  it('should reset to the initial selection on an unseen external change', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackRevisionSelection(
      'column',
      coordinator({ onSelectionChange }),
      { current: false },
      { current: [0] },
      [2],
      undefined,
      setSelection,
    );

    expect(result).toEqual([0]);
    expect(setSelection).toHaveBeenCalledWith([0]);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
  });

  it('should reset to an empty initial selection without notifying the coordinator', () => {
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    const result = resolveGridTrackRevisionSelection(
      'column',
      coordinator({ onSelectionChange }),
      { current: false },
      { current: [] },
      [2],
      undefined,
      setSelection,
    );

    expect(result).toEqual([]);
    expect(setSelection).toHaveBeenCalledWith([]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should keep the current selection untouched when the panel itself made the change', () => {
    const setSelection = vi.fn();

    const result = resolveGridTrackRevisionSelection(
      'column',
      coordinator(),
      { current: true },
      { current: [0] },
      [2],
      undefined,
      setSelection,
    );

    expect(result).toEqual([2]);
    expect(setSelection).not.toHaveBeenCalled();
  });
});
