// store
import { historyStack, store } from '../store';
import { setSelection } from '../design/slice';
import { undo } from '../history/actions';

describe('store', () => {
  it('should hold the design state', () => {
    // result
    expect(store.getState().design.pages[store.getState().design.activePageId]).toBeDefined();
  });

  it('should hand the history stack to thunks', () => {
    // spy
    const spy = vi.spyOn(historyStack, 'undo');

    // before
    store.dispatch(undo());

    // result
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should dispatch plain actions through the reducer', () => {
    // action
    store.dispatch(setSelection(['missing']));

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].selectedIds).toEqual(['missing']);
  });
});
