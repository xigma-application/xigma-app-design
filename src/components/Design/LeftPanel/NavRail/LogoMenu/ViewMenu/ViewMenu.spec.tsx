import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ViewMenu from './ViewMenu';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleRulers } from 'store/design/slice';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <DropdownMenuPrimitive.Root open>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </Provider>,
  );

describe('ViewMenu', () => {
  beforeEach(() => {
    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should render every row with its label', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    [
      'Pixel grid',
      'Layout guides',
      'Rulers',
      'Show slices',
      'Comments',
      'Annotations',
      'Outlines',
      'Pixel preview',
      'Mask outlines',
      'Frame outlines',
      'Memory usage',
      'Additional labels',
      'Minimize UI',
      'Show/Hide UI',
      'Multiplayer cursors',
      'Switch to Draw',
      'Switch to Dev Mode',
      'Panels',
      'Zoom in',
      'Zoom out',
      'Zoom to 100%',
      'Zoom to fit',
      'Zoom to selection',
      'Previous page',
      'Next page',
      'Zoom to previous frame',
      'Zoom to next frame',
      'Find previous frame',
      'Find next frame',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show the globe-icon shortcuts for the page navigation rows verbatim, since they have no key-modifier equivalent', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('🌐↑')).toBeInTheDocument();
    expect(screen.getByText('🌐↓')).toBeInTheDocument();
  });

  it('should keep the Outlines and Panels submenus and the Rulers row enabled while every other flat row stays disabled', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('Pixel grid').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Outlines').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Panels').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Rulers').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should toggle rulers visibility when the Rulers row is selected', () => {
    // before
    renderInMenu(<ViewMenu />);
    expect(selectAreRulersVisible(store.getState())).toBe(false);

    // action
    fireEvent.click(screen.getByText('Rulers'));

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(true);
  });
});
