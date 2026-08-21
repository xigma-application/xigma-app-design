import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Toolbar from './Toolbar';

// core
import CanvasRefsProvider from 'pages/DesignPage/core/CanvasRefsProvider/CanvasRefsProvider';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('Toolbar snapshots', () => {
  it('should render Toolbar', () => {
    // before
    const { asFragment } = render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <Toolbar />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
