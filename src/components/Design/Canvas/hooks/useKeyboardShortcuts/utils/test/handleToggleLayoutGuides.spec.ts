// store
import { selectAreLayoutGuidesVisible } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleToggleLayoutGuides } from '../handleToggleLayoutGuides';

describe('handleToggleLayoutGuides', () => {
  it('should flip the layout guides visibility preference', () => {
    // before
    const wasVisible = selectAreLayoutGuidesVisible(store.getState());

    // action
    handleToggleLayoutGuides(store.dispatch);

    // result
    expect(selectAreLayoutGuidesVisible(store.getState())).toBe(!wasVisible);

    // cleanup
    handleToggleLayoutGuides(store.dispatch);
  });
});
