import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import FileMenu from './FileMenu';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { selectActiveTool } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> => {
  const refs = createCanvasRefs({ canvasRef: { current: document.createElement('canvas') } });

  return render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={refs}>
        <DropdownMenuPrimitive.Root open>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </CanvasRefsContext.Provider>
    </Provider>,
  );
};

describe('FileMenu', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render every row with its label and shortcut', () => {
    // before
    renderInMenu(<FileMenu />);

    // result
    expect(screen.getByText('New Design')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Place image...')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘K')).toBeInTheDocument();
    expect(screen.getByText('Save local copy...')).toBeInTheDocument();
    expect(screen.getByText('Save to version history...')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘S')).toBeInTheDocument();
    expect(screen.getByText('Show version history')).toBeInTheDocument();
    expect(screen.getByText('Export...')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘E')).toBeInTheDocument();
    expect(screen.getByText('Export frames to PDF...')).toBeInTheDocument();
    expect(screen.getByText('Create branch...')).toBeInTheDocument();
  });

  it('should disable every not-yet-implemented flat item but leave the New submenu enabled', () => {
    // before
    renderInMenu(<FileMenu />);

    // result
    expect(screen.getByText('New Design').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Create branch...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('New').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Place image...').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should activate the media tool when Place image is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderInMenu(<FileMenu />);

    // action
    await user.click(screen.getByText('Place image...'));

    // result
    expect(selectActiveTool(store.getState())).toBe(ToolName.media);
  });
});
