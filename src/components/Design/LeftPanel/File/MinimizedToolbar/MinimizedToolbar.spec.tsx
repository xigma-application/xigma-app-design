import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MinimizedToolbar from './MinimizedToolbar';
import { TooltipProvider } from 'shared';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleRulers, toggleUiMinimized } from 'store/design/slice';

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

    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
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

  it('should expand the UI when the whole hover area is clicked, not just the title text', () => {
    // before
    renderMinimizedToolbar();

    // action
    fireEvent.click(screen.getByText('Free'));

    // result
    expect(store.getState().design.isUiMinimized).toBe(false);
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

  it('should shift clear of the rulers when they are visible', () => {
    // mock
    store.dispatch(toggleRulers());

    // before
    const { container } = renderMinimizedToolbar();

    // result
    expect((container.firstChild as HTMLElement).className).toMatch(/withRulers/);
  });

  it('should sit at its default position while the rulers are hidden', () => {
    // before
    const { container } = renderMinimizedToolbar();

    // result
    expect((container.firstChild as HTMLElement).className).not.toMatch(/withRulers/);
  });
});
