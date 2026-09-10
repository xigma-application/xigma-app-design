import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

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

describe('syncExternalGridTrackSelection', () => {
  it('should do nothing when the revision has not changed', () => {
    const revision = {};
    const setSelection = vi.fn();
    const previousRevisionRef: RefObject<unknown> = { current: revision };

    syncExternalGridTrackSelection(
      'column',
      controls({ revision }),
      coordinator(),
      { current: false },
      previousRevisionRef,
      { current: [] },
      setSelection,
    );

    expect(setSelection).not.toHaveBeenCalled();
  });

  it('should skip resetting the selection when the change was made by this panel itself, but still advance the tracked revision', () => {
    const nextRevision = {};
    const setSelection = vi.fn();
    const isSelfChangeRef: RefObject<boolean> = { current: true };
    const previousRevisionRef: RefObject<unknown> = { current: {} };

    syncExternalGridTrackSelection(
      'column',
      controls({ revision: nextRevision }),
      coordinator(),
      isSelfChangeRef,
      previousRevisionRef,
      { current: [] },
      setSelection,
    );

    expect(setSelection).not.toHaveBeenCalled();
    expect(isSelfChangeRef.current).toBe(false);
    expect(previousRevisionRef.current).toBe(nextRevision);
  });

  it('should reset to the initial selection and notify the coordinator when an external change carries a non-empty default', () => {
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
      setSelection,
    );

    expect(setSelection).toHaveBeenCalledWith([]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
