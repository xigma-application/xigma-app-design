import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MinimizeUiButton from './MinimizeUiButton';
import { TooltipProvider } from 'shared';

// store
import { toggleUiMinimized } from 'store/design/slice';
import { store } from 'store';

const renderMinimizeUiButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <MinimizeUiButton />
      </TooltipProvider>
    </Provider>,
  );

describe('MinimizeUiButton', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should show the "Minimize UI" label while expanded', () => {
    // before
    renderMinimizeUiButton();

    // result
    expect(screen.getByRole('button', { name: 'Minimize UI' })).toBeInTheDocument();
  });

  it('should minimize the UI on click', () => {
    // before
    renderMinimizeUiButton();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Minimize UI' }));

    // result
    expect(store.getState().design.isUiMinimized).toBe(true);
  });

  it('should show the "Expand UI" label and expand back on click while minimized', () => {
    // before
    store.dispatch(toggleUiMinimized());
    renderMinimizeUiButton();

    // result
    expect(screen.getByRole('button', { name: 'Expand UI' })).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Expand UI' }));

    // result
    expect(store.getState().design.isUiMinimized).toBe(false);
  });
});
