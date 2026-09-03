import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactElement } from 'react';

// components
import LogoMenu from './LogoMenu';
import Toolbar from 'components/Design/Toolbar/Toolbar';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { TooltipProvider } from 'shared';

// store
import { selectIsActionsPanelOpen } from 'store/design/selectors';
import { setActionsPanelOpen } from 'store/design/slice';
import { store } from 'store';

const renderLogoMenu = (element: ReactElement): ReturnType<typeof render> => render(<Provider store={store}>{element}</Provider>);

const renderLogoMenuWithToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <LogoMenu />
          <Toolbar />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('LogoMenu', () => {
  beforeEach(() => {
    store.dispatch(setActionsPanelOpen(false));
  });

  it('should render a closed “xigma” trigger button', () => {
    // before
    renderLogoMenu(<LogoMenu />);

    // result
    const trigger = screen.getByRole('button', { name: 'xigma' });
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('should mark the trigger active and reveal the menu content when clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderLogoMenu(<LogoMenu />);
    const trigger = screen.getByRole('button', { name: 'xigma' });
    await user.click(trigger);

    // result
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Back to files')).toBeInTheDocument();
    expect(screen.getByText('Actions...')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Object')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Arrange')).toBeInTheDocument();
    expect(screen.getByText('Vector')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Open in desktop app')).toBeInTheDocument();
    expect(screen.getByText('AI balance')).toBeInTheDocument();
    expect(screen.getByText('Help and account')).toBeInTheDocument();
  });

  it('should disable the not-yet-implemented flat items but leave the expandable ones and Actions enabled', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderLogoMenu(<LogoMenu />);
    await user.click(screen.getByRole('button', { name: 'xigma' }));

    // result — disabled
    expect(screen.getByText('Back to files').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Libraries').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('AI balance').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');

    // result — expandable, not disabled
    expect(screen.getByText('File').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Plugins').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Widgets').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Preferences').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Help and account').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // result — Actions is unlocked
    expect(screen.getByText('Actions...').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should open the Actions panel when the Actions row is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderLogoMenu(<LogoMenu />);
    await user.click(screen.getByRole('button', { name: 'xigma' }));

    // action
    await user.click(screen.getByText('Actions...'));

    // result
    expect(selectIsActionsPanelOpen(store.getState())).toBe(true);
  });

  it('should keep the Actions panel open, not have it dismissed by the menu returning focus to its own trigger on close', async () => {
    // mock
    const user = userEvent.setup();

    // before — Toolbar mounted alongside so the Actions panel's own real Popover/focus-outside
    // detection is present, reproducing the race this test guards against
    renderLogoMenuWithToolbar();
    await user.click(screen.getByRole('button', { name: 'xigma' }));

    // action
    await user.click(screen.getByText('Actions...'));

    // result
    expect(await screen.findByPlaceholderText('Search')).toBeInTheDocument();
    expect(selectIsActionsPanelOpen(store.getState())).toBe(true);
  });
});
