import { act, renderHook } from '@testing-library/react';
import { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { TGridAxisControls } from '../../../hooks/types';
import { TGridTrackSelectionCoordinator, useGridTrackSelectionCoordinator } from '../../../hooks/useGridTrackSelectionCoordinator';
import { useGridTrackList } from './useGridTrackList';

// store
import { selectGridTrackSelection, selectPanelGridTrackSelection } from 'store/design/selectors';
import { setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

const TEST_FRAME_ID = 'frame-1';

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(() => [0]),
  revision: {},
  tracks: [
    { index: 0, mode: 'fill', value: 1 },
    { index: 1, mode: 'fill', value: 1 },
    { index: 2, mode: 'fill', value: 1 },
  ] as TGridAxisControls['tracks'],
  ...overrides,
});

const permissiveCoordinator = (): TGridTrackSelectionCoordinator => ({
  activeAxis: null,
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
});

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useGridTrackList', () => {
  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
  });

  it('should start with no selection, no drag and no drop indicator', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

    expect(result.current.selectedIndices).toEqual([]);
    expect(result.current.dropIndicatorIndex).toBeNull();
    expect(result.current.isRowDragging(0)).toBe(false);
  });

  it('should start with the given initial selection', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID, [0]), { wrapper });

    expect(result.current.selectedIndices).toEqual([0]);
  });

  it('should reflect a selection published to the panel field for this axis and frame (e.g. a canvas click)', () => {
    const { result, rerender } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId: TEST_FRAME_ID, indices: [2] }));
    });
    rerender();

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should ignore a panel selection published for a different frame', () => {
    const { result, rerender } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID, [0]), {
      wrapper,
    });

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId: 'other-frame', indices: [2] }));
    });
    rerender();

    expect(result.current.selectedIndices).toEqual([0]);
  });

  it('should hide its own selection once the panel field belongs to the other axis for this frame', () => {
    const { result, rerender } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID, [0]), {
      wrapper,
    });

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'row', frameId: TEST_FRAME_ID, indices: [2] }));
    });
    rerender();

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should publish both the panel-facing and canvas-facing selection when a row is clicked', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

    act(() => result.current.onSelectRow(1, { meta: false, shift: false }));

    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId: TEST_FRAME_ID, indices: [1] });
    expect(selectPanelGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId: TEST_FRAME_ID, indices: [1] });
  });

  it('should publish a clear (null) once the only selected row is toggled off', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

    act(() => result.current.onSelectRow(0, { meta: true, shift: false }));
    act(() => result.current.onSelectRow(0, { meta: true, shift: false }));

    expect(selectGridTrackSelection(store.getState())).toBeNull();
    expect(selectPanelGridTrackSelection(store.getState())).toBeNull();
  });

  it('should delete the whole selection when the deleted row is part of it, then clear it', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useGridTrackList(controls({ onDelete }), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.onDeleteRow(1));

    expect(onDelete).toHaveBeenCalledWith([0, 1]);
    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should delete just the given row when it is outside the selection', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useGridTrackList(controls({ onDelete }), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onDeleteRow(2));

    expect(onDelete).toHaveBeenCalledWith([2]);
  });

  it('should drag the whole selection when the grabbed row is part of it, and keep it selected at its new position', () => {
    const onReorder = vi.fn(() => [1, 2]);
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

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
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.beginDrag(1, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).not.toHaveBeenCalled();
    expect(result.current.selectedIndices).toEqual([1]);
  });

  it('should keep the drop indicator hidden until the pointer actually moves', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

    act(() => result.current.beginDrag(1, pointerEvent()));
    expect(result.current.dropIndicatorIndex).toBeNull();

    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    expect(result.current.dropIndicatorIndex).not.toBeNull();
  });

  it('should select an unselected row the moment it is grabbed, before the drag even resolves', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

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
    const { result } = renderHook(
      () => useGridTrackList(controls({ onReorder, tracks: linkedTracks }), 'column', permissiveCoordinator(), TEST_FRAME_ID),
      { wrapper },
    );

    act(() => result.current.beginDrag(1, pointerEvent()));

    // grabbing track 1 alone pulled its linked partner (track 0) along too
    expect(result.current.selectedIndices).toEqual([0, 1]);

    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 100 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).toHaveBeenCalledWith([0, 1], 0);
  });

  it('should keep the newly grabbed row selected after a rejected reorder', () => {
    const onReorder = vi.fn(() => null);
    const { result } = renderHook(() => useGridTrackList(controls({ onReorder }), 'column', permissiveCoordinator(), TEST_FRAME_ID), {
      wrapper,
    });

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
    const { result } = renderHook(
      () => useGridTrackList(controls({ onAdd, onChangeMode, onChangeValue }), 'column', permissiveCoordinator(), TEST_FRAME_ID),
      { wrapper },
    );

    act(() => result.current.onAdd());
    act(() => result.current.onChangeMode(0, 'fixed' as never));
    act(() => result.current.onChangeValue(0, 40));

    expect(onAdd).toHaveBeenCalled();
    expect(onChangeMode).toHaveBeenCalledWith([0], 'fixed', undefined);
    expect(onChangeValue).toHaveBeenCalledWith([0], 0, 40);
  });

  it('should apply a mode or value change to every selected row when the edited row is part of a multi-selection', () => {
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();
    const { result } = renderHook(
      () => useGridTrackList(controls({ onChangeMode, onChangeValue }), 'column', permissiveCoordinator(), TEST_FRAME_ID),
      { wrapper },
    );

    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(2, { meta: true, shift: false }));
    act(() => result.current.onChangeMode(2, 'hug' as never));
    act(() => result.current.onChangeValue(0, 40));

    expect(onChangeMode).toHaveBeenCalledWith([0, 2], 'hug', undefined);
    expect(onChangeValue).toHaveBeenCalledWith([0, 2], 0, 40);
  });

  it('should expose a per-row ref registrar', () => {
    const { result } = renderHook(() => useGridTrackList(controls(), 'column', permissiveCoordinator(), TEST_FRAME_ID), { wrapper });

    expect(() => result.current.registerRow(0)(null)).not.toThrow();
  });

  it('should report its own selection to the coordinator and clear itself when the coordinator suppresses it', () => {
    const useHarness = (): { columns: ReturnType<typeof useGridTrackList>; rows: ReturnType<typeof useGridTrackList> } => {
      const coordinator = useGridTrackSelectionCoordinator();
      const columns = useGridTrackList(controls(), 'column', coordinator, TEST_FRAME_ID, [0]);
      const rows = useGridTrackList(controls(), 'row', coordinator, TEST_FRAME_ID);

      return { columns, rows };
    };

    const { result } = renderHook(() => useHarness(), { wrapper });

    expect(result.current.columns.selectedIndices).toEqual([0]);

    act(() => result.current.rows.onSelectRow(1, { meta: false, shift: false }));

    expect(result.current.rows.selectedIndices).toEqual([1]);
    expect(result.current.columns.selectedIndices).toEqual([]);
  });
});
