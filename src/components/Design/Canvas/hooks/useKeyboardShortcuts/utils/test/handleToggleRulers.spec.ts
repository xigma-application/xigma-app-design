// store
import { setDesignHintLabelKey, toggleRulers } from 'store/design/slice';
import { selectAreRulersVisible, selectDesignHintLabelKey } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleToggleRulers } from '../handleToggleRulers';

describe('handleToggleRulers', () => {
  beforeEach(() => {
    store.dispatch(setDesignHintLabelKey(null));

    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should show a "rulers shown" hint when toggling rulers on', () => {
    // before
    expect(selectAreRulersVisible(store.getState())).toBe(false);

    // action
    handleToggleRulers(store.dispatch);

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(true);
    expect(selectDesignHintLabelKey(store.getState())).toBe('design.toolbar.rulersHint.shown');
  });

  it('should show a "rulers hidden" hint when toggling rulers off', () => {
    // mock
    store.dispatch(toggleRulers());
    expect(selectAreRulersVisible(store.getState())).toBe(true);

    // action
    handleToggleRulers(store.dispatch);

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(false);
    expect(selectDesignHintLabelKey(store.getState())).toBe('design.toolbar.rulersHint.hidden');
  });
});
