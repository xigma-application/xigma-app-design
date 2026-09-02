import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import RulersLayer from './RulersLayer';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleRulers } from 'store/design/slice';

const renderRulersLayer = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <RulersLayer />
      </CanvasRefsProvider>
    </Provider>,
  );

describe('RulersLayer', () => {
  beforeEach(() => {
    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should render nothing while rulers are hidden', () => {
    // before
    const { container } = renderRulersLayer();

    // result
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('should mount the overlay canvas once rulers are visible', () => {
    // mock
    store.dispatch(toggleRulers());

    // before
    const { container } = renderRulersLayer();

    // result
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});
