import { act, renderHook } from '@testing-library/react';
import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { TGridAxisControls } from '../../../hooks/types';
import { TGridTrackSelectionCoordinator, useGridTrackSelectionCoordinator } from '../../../hooks/useGridTrackSelectionCoordinator';
import { useGridTrackList } from './useGridTrackList';

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

const DEFAULT_REVISION = {};

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(() => [0]),
  revision: DEFAULT_REVISION,
  tracks: [
    { index: 0, mode: 'fill', value: 1 },
    { index: 1, mode: 'fill', value: 1 },
    { index: 2, mode: 'fill', value: 1 },
  ] as TGridAxisControls['tracks'],
  ...overrides,
});

const permissiveCoordinator = (): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
});

describe('useGridTrackList', () => {
  it('should start with no selection, no drag and no drop indicator', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator()));

    expect(result.current.selectedIndices).toEqual([]);
    expect(result.current.dropIndicatorIndex).toBeNull();
    expect(result.current.isRowDragging(0)).toBe(false);
  });

  it('should start with the given initial selection', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), [0]));

    expect(result.current.selectedIndices).toEqual([0]);
  });

  it('should delete the whole selection when the deleted row is part of it, then clear it', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useGridTrackList(controls({ onDelete }), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.onDeleteRow(1));

    expect(onDelete).toHaveBeenCalledWith([0, 1]);
    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should delete just the given row when it is outside the selection', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useGridTrackList(controls({ onDelete }), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onDeleteRow(2));

    expect(onDelete).toHaveBeenCalledWith([2]);
  });

  it('should drag the whole selection when the grabbed row is part of it, and keep it selected at its new position', () => {
    const onReorder = vi.fn(() => [1, 2]);
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.beginDrag(1, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).toHaveBeenCalledWith([0, 1], 0);
    expect(result.current.selectedIndices).toEqual([1, 2]);
  });

  it('should collapse a multi-selection to just the grabbed row when released without moving', () => {
    const onReorder = vi.fn(() => [1, 2]);
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.beginDrag(1, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).not.toHaveBeenCalled();
    expect(result.current.selectedIndices).toEqual([1]);
  });

  it('should keep the drop indicator hidden until the pointer actually moves', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator()));

    act(() => result.current.beginDrag(1, pointerEvent()));
    expect(result.current.dropIndicatorIndex).toBeNull();

    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    expect(result.current.dropIndicatorIndex).not.toBeNull();
  });

  it('should select an unselected row the moment it is grabbed, before the drag even resolves', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.beginDrag(2, pointerEvent()));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should auto-extend the drag to every track a spanning child links to the grabbed one', () => {
    const onReorder = vi.fn(() => [0, 1]);
    const linkedTracks = [
      { index: 0, linkedIndices: [0, 1], mode: 'fill', value: 1 },
      { index: 1, linkedIndices: [0, 1], mode: 'fill', value: 1 },
      { index: 2, linkedIndices: [2], mode: 'fill', value: 1 },
    ] as TGridAxisControls['tracks'];
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder, tracks: linkedTracks }), 'column', permissiveCoordinator()));

    act(() => result.current.beginDrag(1, pointerEvent()));

    // grabbing track 1 alone pulled its linked partner (track 0) along too
    expect(result.current.selectedIndices).toEqual([0, 1]);

    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).toHaveBeenCalledWith([0, 1], 0);
  });

  it('should keep the newly grabbed row selected after a rejected reorder', () => {
    const onReorder = vi.fn(() => null);
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator()));

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.beginDrag(2, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).toHaveBeenCalledWith([2], 0);
    // the drag already selected row 2; a rejected reorder does not undo that
    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should forward onAdd, onChangeMode and onChangeValue to the controls', () => {
    const onAdd = vi.fn();
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();
    const { result } = renderHook(() =>
      useGridTrackList(controls({ onAdd, onChangeMode, onChangeValue }), 'column', permissiveCoordinator()),
    );

    act(() => result.current.onAdd());
    act(() => result.current.onChangeMode(0, 'fixed' as never));
    act(() => result.current.onChangeValue(0, 40));

    expect(onAdd).toHaveBeenCalled();
    expect(onChangeMode).toHaveBeenCalledWith(0, 'fixed', undefined);
    expect(onChangeValue).toHaveBeenCalledWith(0, 40);
  });

  it('should not clear the selection when the panel’s own edit is what changed the revision', () => {
    const revisionA = {};
    const revisionB = {};
    const { result, rerender } = renderHook(({ trackControls }) => useGridTrackList(trackControls, 'column', permissiveCoordinator()), {
      initialProps: { trackControls: controls({ revision: revisionA }) },
    });

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onChangeValue(0, 40));

    // the store round-trip that a real onChangeValue dispatch would produce — a brand new frame
    // object reference (revisionB), even though only this one track's own value changed
    rerender({ trackControls: controls({ revision: revisionB }) });

    expect(result.current.selectedIndices).toEqual([0]);
  });

  it('should clear a stale selection when the revision changes to one the panel never recorded (an external edit)', () => {
    const revisionA = {};
    const revisionB = {};
    const { result, rerender } = renderHook(({ trackControls }) => useGridTrackList(trackControls, 'column', permissiveCoordinator()), {
      initialProps: { trackControls: controls({ revision: revisionA }) },
    });

    act(() => result.current.onSelectRow(1, { meta: false, shift: false }));
    expect(result.current.selectedIndices).toEqual([1]);

    // a frame object this hook has never seen (an edit made somewhere else) — reset to the default
    rerender({ trackControls: controls({ revision: revisionB }) });

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should restore a revision’s own recorded selection when undo/redo brings that revision back', () => {
    const revisionA = {};
    const revisionB = {};
    const { result, rerender } = renderHook(({ trackControls }) => useGridTrackList(trackControls, 'column', permissiveCoordinator()), {
      initialProps: { trackControls: controls({ revision: revisionA }) },
    });

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    expect(result.current.selectedIndices).toEqual([0, 1]);

    // a panel-made edit rolls the revision forward without disturbing the selection
    act(() => result.current.onChangeValue(0, 40));
    rerender({ trackControls: controls({ revision: revisionB }) });
    expect(result.current.selectedIndices).toEqual([0, 1]);

    // an undo brings revisionA back — its recorded two-track selection is restored, not reset
    rerender({ trackControls: controls({ revision: revisionA }) });
    expect(result.current.selectedIndices).toEqual([0, 1]);

    // and a redo forward to revisionB restores what was selected there too
    rerender({ trackControls: controls({ revision: revisionB }) });
    expect(result.current.selectedIndices).toEqual([0, 1]);
  });

  it('should still detect an external change when the track content happens to look identical (e.g. reordering two same-sized Fill columns)', () => {
    const revisionA = {};
    const revisionB = {};
    const identicalTracks = [
      { index: 0, linkedIndices: [0], mode: 'fill', value: 1 },
      { index: 1, linkedIndices: [1], mode: 'fill', value: 1 },
      { index: 2, linkedIndices: [2], mode: 'fill', value: 1 },
    ] as TGridAxisControls['tracks'];
    const { result, rerender } = renderHook(({ trackControls }) => useGridTrackList(trackControls, 'column', permissiveCoordinator()), {
      initialProps: { trackControls: controls({ revision: revisionA, tracks: identicalTracks }) },
    });

    act(() => result.current.onSelectRow(1, { meta: false, shift: false }));
    expect(result.current.selectedIndices).toEqual([1]);

    // an undo swaps two indistinguishable Fill/1 tracks — the content signature would be
    // unchanged, but the frame it came from is a new object, so this must still be detected
    rerender({ trackControls: controls({ revision: revisionB, tracks: identicalTracks }) });

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should expose a per-row ref registrar', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator()));

    expect(() => result.current.registerRow(0)(null)).not.toThrow();
  });

  it('should report its own selection to the coordinator and clear itself when the coordinator suppresses it', () => {
    const useHarness = (): { columns: ReturnType<typeof useGridTrackList>; rows: ReturnType<typeof useGridTrackList> } => {
      const coordinator = useGridTrackSelectionCoordinator();
      const columns = useGridTrackList(controls(), 'column', coordinator, [0]);
      const rows = useGridTrackList(controls(), 'row', coordinator);

      return { columns, rows };
    };

    const { result } = renderHook(() => useHarness());

    expect(result.current.columns.selectedIndices).toEqual([0]);

    act(() => result.current.rows.onSelectRow(1, { meta: false, shift: false }));

    expect(result.current.rows.selectedIndices).toEqual([1]);
    expect(result.current.columns.selectedIndices).toEqual([]);
  });

  it('should reset an external change back to this axis’s own default selection, not to nothing', () => {
    const revisionA = {};
    const revisionB = {};
    const useHarness = ({
      columnRevision,
    }: {
      columnRevision: unknown;
    }): { columns: ReturnType<typeof useGridTrackList>; rows: ReturnType<typeof useGridTrackList> } => {
      const coordinator = useGridTrackSelectionCoordinator();
      const columns = useGridTrackList(controls({ revision: columnRevision }), 'column', coordinator, [0]);
      const rows = useGridTrackList(controls(), 'row', coordinator);

      return { columns, rows };
    };

    const { result, rerender } = renderHook((props) => useHarness(props), {
      initialProps: { columnRevision: revisionA },
    });

    // move the selection away from the default first, so the reset below is actually observable
    act(() => result.current.columns.onSelectRow(2, { meta: false, shift: false }));
    expect(result.current.columns.selectedIndices).toEqual([2]);

    // an undo changes columns' underlying frame without going through any of this panel's own actions
    rerender({ columnRevision: revisionB });

    // column 1 stays the visible default instead of the panel showing nothing selected at all
    expect(result.current.columns.selectedIndices).toEqual([0]);
    // and rows correctly stays suppressed, since columns is still the coordinator's active axis
    expect(result.current.rows.selectedIndices).toEqual([]);
  });
});
