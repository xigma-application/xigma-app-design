import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MinimizedHeader from './MinimizedHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleRulers } from 'store/design/slice';

const renderMinimizedHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <CanvasRefsProvider>
          <MinimizedHeader />
        </CanvasRefsProvider>
      </TooltipProvider>
    </Provider>,
  );

describe('MinimizedHeader behaviors', () => {
  it('should render the avatar, zoom, and present/share triggers in one row', () => {
    // before
    renderMinimizedHeader();

    // result
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom' })).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('should shift further from the edge to clear the rulers when they are visible', () => {
    // mock
    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }

    // before
    const { container } = renderMinimizedHeader();

    // result
    expect(container.querySelector('[class*="withRulers"]')).toBeNull();

    // action
    act(() => {
      store.dispatch(toggleRulers());
    });

    // result
    expect(container.querySelector('[class*="withRulers"]')).not.toBeNull();

    // cleanup
    act(() => {
      store.dispatch(toggleRulers());
    });
  });
});
