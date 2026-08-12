import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

// components
import DesignPage from './DesignPage';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('DesignPage snapshots', () => {
  it('should render DesignPage', () => {
    // before
    const { asFragment } = render(
      <Provider store={store}>
        <TooltipProvider>
          <DesignPage />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
