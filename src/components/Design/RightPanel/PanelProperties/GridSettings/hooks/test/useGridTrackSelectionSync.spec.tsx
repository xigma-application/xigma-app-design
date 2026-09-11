import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useGridTrackSelectionSync } from '../useGridTrackSelectionSync';

// store
import { selectGridTrackSelection } from 'store/design/selectors';
import { setGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

type TProps = { activeAxis: TGridTrackAxis | null; frameId: string | null; selectedIndices: number[] };

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const render = (
  frameId: string | null,
  activeAxis: TGridTrackAxis | null,
  selectedIndices: number[],
): ReturnType<typeof renderHook<void, TProps>> =>
  renderHook(({ activeAxis: axis, frameId: id, selectedIndices: indices }) => useGridTrackSelectionSync(id, axis, indices), {
    initialProps: { activeAxis, frameId, selectedIndices },
    wrapper,
  });

describe('useGridTrackSelectionSync', () => {
  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
  });

  it('should not touch an existing selection on mount, even when it already has a selection to report', () => {
    // guards against clobbering a selection that arrived from outside (e.g. a canvas click that
    // opened this panel for the first time) before this panel's own derived state has settled
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [5] }));

    render('frame-1', 'column', [1]);

    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'row', frameId: 'frame-1', indices: [5] });
  });

  it('should publish the active axis and its selected indices once they change after mount', () => {
    const { rerender } = render('frame-1', 'column', [1]);

    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [1, 2] });

    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId: 'frame-1', indices: [1, 2] });
  });

  it('should publish a row-axis multi-selection just the same', () => {
    const { rerender } = render('frame-1', 'row', []);

    rerender({ activeAxis: 'row', frameId: 'frame-1', selectedIndices: [1, 2] });

    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'row', frameId: 'frame-1', indices: [1, 2] });
  });

  it('should clear a selection it previously published once it changes to having no frame', () => {
    const { rerender } = render('frame-1', 'column', [1]);

    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [1, 2] });
    expect(selectGridTrackSelection(store.getState())).not.toBeNull();

    rerender({ activeAxis: 'column', frameId: null, selectedIndices: [1] });

    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should clear a selection it previously published once it changes to having no active axis', () => {
    const { rerender } = render('frame-1', 'column', [1]);

    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [1, 2] });
    rerender({ activeAxis: null, frameId: 'frame-1', selectedIndices: [1] });

    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should clear a selection it previously published once the active axis changes to having no selected indices', () => {
    const { rerender } = render('frame-1', 'column', [1]);

    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [1, 2] });
    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [] });

    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should not dispatch a clear when it never actually published anything (e.g. a still-settling mount)', () => {
    const { rerender } = render('frame-1', 'column', [1]);

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    rerender({ activeAxis: null, frameId: 'frame-1', selectedIndices: [1] });

    expect(dispatchSpy).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });

  it('should clear the selection when the hook unmounts after publishing', () => {
    const { rerender, unmount } = render('frame-1', 'column', [1]);

    rerender({ activeAxis: 'column', frameId: 'frame-1', selectedIndices: [1, 2] });
    unmount();

    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should not dispatch on unmount when it never actually published anything', () => {
    const { unmount } = render('frame-1', 'column', [1]);

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    unmount();

    expect(dispatchSpy).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });
});
