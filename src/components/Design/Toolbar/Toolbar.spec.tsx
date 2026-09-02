import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Toolbar from './Toolbar';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { TooltipProvider } from 'shared';

// store
import { setActionsPanelOpen, toggleUiHidden } from 'store/design/slice';
import { store } from 'store';

const renderToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Toolbar />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Toolbar snapshots', () => {
  it('should render Toolbar', () => {
    // before
    const { asFragment } = renderToolbar();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Toolbar behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActionsPanelOpen(false));
  });

  it('should open the Actions panel on click and dispatch isActionsPanelOpen', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderToolbar();
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();

    // action
    await user.click(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(true);
    expect(await screen.findByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render the panel already open when isActionsPanelOpen is true, e.g. after the Cmd+K shortcut', () => {
    // mock
    store.dispatch(setActionsPanelOpen(true));

    // before
    renderToolbar();

    // result
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should close the panel and clear isActionsPanelOpen when the trigger is clicked again while open', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(setActionsPanelOpen(true));

    // before
    renderToolbar();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    // action
    await user.click(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(false);
  });

  it('should render nothing when the UI is hidden', () => {
    // mock
    store.dispatch(toggleUiHidden());

    // before
    const { container } = renderToolbar();

    // result
    expect(container.firstChild).toBeNull();

    // cleanup
    store.dispatch(toggleUiHidden());
  });
});
