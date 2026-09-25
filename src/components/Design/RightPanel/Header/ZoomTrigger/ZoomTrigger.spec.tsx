import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ZoomTrigger from './ZoomTrigger';
import { TooltipProvider } from 'shared';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

vi.mock('../ZoomMenu/ZoomMenu', () => ({ default: (): ReactElement => <span>zoom menu</span> }));

describe('ZoomTrigger behaviors', () => {
  it('should show the rounded zoom percentage on its trigger', () => {
    // mock
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1.234 }));

    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <ZoomTrigger />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveTextContent('123%');

    // cleanup
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });
});
