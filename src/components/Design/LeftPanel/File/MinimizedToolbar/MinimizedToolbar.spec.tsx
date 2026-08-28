import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MinimizedToolbar from './MinimizedToolbar';
import { TooltipProvider } from 'shared';

// store
import { toggleUiMinimized } from 'store/design/slice';
import { store } from 'store';

const renderMinimizedToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <MinimizedToolbar name="Screenshots" />
      </TooltipProvider>
    </Provider>,
  );

describe('MinimizedToolbar', () => {
  beforeEach(() => {
    if (!store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should render the inert logo and the file name', () => {
    // before
    renderMinimizedToolbar();

    // result
    expect(screen.getByRole('button', { name: 'xigma' })).toBeInTheDocument();
    expect(screen.getByText('Screenshots')).toBeInTheDocument();
  });

  it('should expand the UI when the title is clicked, without entering rename mode', () => {
    // before
    renderMinimizedToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Screenshots' }));

    // result
    expect(store.getState().design.isUiMinimized).toBe(false);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render the collapse toggle showing "Expand UI"', () => {
    // before
    renderMinimizedToolbar();

    // result
    expect(screen.getByRole('button', { name: 'Expand UI' })).toBeInTheDocument();
  });

  it('should render the Free subscription chip', () => {
    // before
    renderMinimizedToolbar();

    // result
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
