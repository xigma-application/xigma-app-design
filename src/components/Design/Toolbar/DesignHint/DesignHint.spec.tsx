import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import DesignHint from './DesignHint';

// others
import { DESIGN_HINT_DURATION_MS, ZOOM_HINT_FIT_LABEL_KEY } from './constants';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { store } from 'store';

const renderDesignHint = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <DesignHint />
    </Provider>,
  );

describe('DesignHint behaviors', () => {
  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
    vi.useRealTimers();
  });

  it('should render nothing when there is no hint to show', () => {
    // before
    renderDesignHint();

    // result
    expect(screen.queryByText('Zoomed to fit')).not.toBeInTheDocument();
  });

  it('should render the translated text for the current hint label key', () => {
    // mock
    store.dispatch(setDesignHintLabelKey(ZOOM_HINT_FIT_LABEL_KEY));

    // before
    renderDesignHint();

    // result
    expect(screen.getByText('Zoomed to fit')).toBeInTheDocument();
  });

  it('should clear the hint label key once the auto-hide duration elapses', () => {
    // mock
    vi.useFakeTimers();
    store.dispatch(setDesignHintLabelKey(ZOOM_HINT_FIT_LABEL_KEY));

    // before
    renderDesignHint();

    // action
    vi.advanceTimersByTime(DESIGN_HINT_DURATION_MS);

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });
});
