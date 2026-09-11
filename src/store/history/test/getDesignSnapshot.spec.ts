// store
import { setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { getDesignSnapshot } from '../getDesignSnapshot';

describe('getDesignSnapshot', () => {
  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
  });

  it('should capture the current pages record and active page id', () => {
    // action
    const snapshot = getDesignSnapshot(store.getState());

    // result
    expect(snapshot.activePageId).toBe(store.getState().design.activePageId);
    expect(snapshot.pages).toBe(store.getState().design.pages);
  });

  it('should capture the current canvas and panel grid track selection', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 2] }));
    store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 2] }));

    // action
    const snapshot = getDesignSnapshot(store.getState());

    // result
    expect(snapshot.gridTrackSelection).toEqual({ axis: 'column', frameId: 'frame-1', indices: [0, 2] });
    expect(snapshot.panelGridTrackSelection).toEqual({ axis: 'column', frameId: 'frame-1', indices: [0, 2] });
  });

  it('should capture null grid track selection when none is set', () => {
    // action
    const snapshot = getDesignSnapshot(store.getState());

    // result
    expect(snapshot.gridTrackSelection).toBeNull();
    expect(snapshot.panelGridTrackSelection).toBeNull();
  });
});
