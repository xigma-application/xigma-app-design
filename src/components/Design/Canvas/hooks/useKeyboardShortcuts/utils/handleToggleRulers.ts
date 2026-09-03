// store
import { setDesignHintLabelKey, toggleRulers } from 'store/design/slice';
import { selectAreRulersVisible } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

const RULERS_HINT_SHOWN_LABEL_KEY = 'design.toolbar.rulersHint.shown';
const RULERS_HINT_HIDDEN_LABEL_KEY = 'design.toolbar.rulersHint.hidden';

export const handleToggleRulers = (dispatch: AppDispatch): void => {
  const wasVisible = selectAreRulersVisible(store.getState());

  dispatch(toggleRulers());
  dispatch(setDesignHintLabelKey(wasVisible ? RULERS_HINT_HIDDEN_LABEL_KEY : RULERS_HINT_SHOWN_LABEL_KEY));
};
