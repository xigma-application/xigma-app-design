import * as PopoverPrimitive from '@radix-ui/react-popover';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ActionsButton from './ActionsButton';
import { TooltipProvider } from 'shared';

// store
import { setActionsPanelOpen } from 'store/design/slice';
import { store } from 'store';

const renderActionsButton = (timeoutEnter?: number): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider timeoutEnter={timeoutEnter}>
        <PopoverPrimitive.Root>
          <ActionsButton />
        </PopoverPrimitive.Root>
      </TooltipProvider>
    </Provider>,
  );

describe('ActionsButton', () => {
  beforeEach(() => {
    store.dispatch(setActionsPanelOpen(false));
  });

  it('should render as a labeled button', () => {
    // before
    renderActionsButton();

    // result
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
  });

  it('should show the label and its keyboard shortcut in a tooltip on hover', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderActionsButton(0);

    // action
    await user.hover(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(await screen.findByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should recolor the icon for the on-blue state once isActionsPanelOpen is true in the store', () => {
    // mock
    store.dispatch(setActionsPanelOpen(true));

    // before
    renderActionsButton();

    // result
    expect(screen.getByRole('button', { name: 'Actions' }).querySelector('svg')).toHaveStyle({ color: 'var(--color-on-blue-1)' });
  });

  it('should color the icon plain neutral while isActionsPanelOpen is false', () => {
    // before
    renderActionsButton();

    // result
    expect(screen.getByRole('button', { name: 'Actions' }).querySelector('svg')).toHaveStyle({ color: 'var(--color-neutral-1)' });
  });
});
