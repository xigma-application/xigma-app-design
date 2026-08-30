import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

// components
import App from './App';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderApp = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </Provider>,
  );

describe('App snapshots', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should render App', () => {
    // before
    const { asFragment } = renderApp();

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should sync the theme onto the document root on mount', () => {
    // before
    renderApp();

    // result
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
