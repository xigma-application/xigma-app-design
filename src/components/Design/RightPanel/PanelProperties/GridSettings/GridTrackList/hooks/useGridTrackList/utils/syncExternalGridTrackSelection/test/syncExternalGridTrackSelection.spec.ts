import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { syncExternalGridTrackSelection } from '../syncExternalGridTrackSelection';

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

const mapRef = (): RefObject<WeakMap<object, number[]>> => ({ current: new WeakMap<object, number[]>() });

describe('syncExternalGridTrackSelection', () => {
  it('should record the live selection under the current revision when nothing changed', () => {
    const revision = {};
    const byRevision = mapRef();
    const previousRevisionRef: RefObject<unknown> = { current: revision };
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'column',
      controls({ revision }),
      coordinator(),
      { current: false },
      previousRevisionRef,
      { current: [] },
      byRevision,
      [2],
      setSelection,
    );

    expect(setSelection).not.toHaveBeenCalled();
    expect(byRevision.current.get(revision)).toEqual([2]);
  });

  it('should skip resetting when the panel itself made the change, but still track the new revision and its selection', () => {
    const nextRevision = {};
    const byRevision = mapRef();
    const isSelfChangeRef: RefObject<boolean> = { current: true };
    const previousRevisionRef: RefObject<unknown> = { current: {} };
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'column',
      controls({ revision: nextRevision }),
      coordinator(),
      isSelfChangeRef,
      previousRevisionRef,
      { current: [] },
      byRevision,
      [1, 2],
      setSelection,
    );

    expect(setSelection).not.toHaveBeenCalled();
    expect(isSelfChangeRef.current).toBe(false);
    expect(previousRevisionRef.current).toBe(nextRevision);
    expect(byRevision.current.get(nextRevision)).toEqual([1, 2]);
  });

  it('should reset to the initial selection and notify the coordinator on an unseen external change with a non-empty default', () => {
    const nextRevision = {};
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'column',
      controls({ revision: nextRevision }),
      coordinator({ onSelectionChange }),
      { current: false },
      { current: {} },
      { current: [0] },
      mapRef(),
      [2],
      setSelection,
    );

    expect(setSelection).toHaveBeenCalledWith([0]);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
  });

  it('should reset to an empty selection without notifying the coordinator when the default is empty', () => {
    const nextRevision = {};
    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'column',
      controls({ revision: nextRevision }),
      coordinator({ onSelectionChange }),
      { current: false },
      { current: {} },
      { current: [] },
      mapRef(),
      [2],
      setSelection,
    );

    expect(setSelection).toHaveBeenCalledWith([]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should restore the exact selection recorded for a revision it has seen before (an undo/redo landing)', () => {
    const undoneRevision = {};
    const byRevision = mapRef();

    byRevision.current.set(undoneRevision, [0, 1]);

    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'column',
      controls({ revision: undoneRevision }),
      coordinator({ onSelectionChange }),
      { current: false },
      { current: {} },
      { current: [0] },
      byRevision,
      [1, 2],
      setSelection,
    );

    expect(setSelection).toHaveBeenCalledWith([0, 1]);
    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
  });

  it('should release the axis when the restored selection for a seen revision is empty', () => {
    const undoneRevision = {};
    const byRevision = mapRef();

    byRevision.current.set(undoneRevision, []);

    const onSelectionChange = vi.fn();
    const setSelection = vi.fn();

    syncExternalGridTrackSelection(
      'row',
      controls({ revision: undoneRevision }),
      coordinator({ onSelectionChange }),
      { current: false },
      { current: {} },
      { current: [] },
      byRevision,
      [1],
      setSelection,
    );

    expect(setSelection).toHaveBeenCalledWith([]);
    expect(onSelectionChange).toHaveBeenCalledWith('row', false);
  });

  it('should not touch the map when the revision is not an object (no grid frame)', () => {
    const setSelection = vi.fn();
    const previousRevisionRef: RefObject<unknown> = { current: null };

    expect(() =>
      syncExternalGridTrackSelection(
        'column',
        controls({ revision: null }),
        coordinator(),
        { current: false },
        previousRevisionRef,
        { current: [] },
        mapRef(),
        [],
        setSelection,
      ),
    ).not.toThrow();
    expect(setSelection).not.toHaveBeenCalled();
  });
});
