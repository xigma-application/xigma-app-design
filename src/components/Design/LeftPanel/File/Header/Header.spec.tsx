import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Header from './Header';
import { TooltipProvider } from 'shared';

// store
import { toggleUiMinimized } from 'store/design/slice';
import { store } from 'store';

// types
import { THeaderProps } from './types';

const renderHeader = (props: THeaderProps): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <Header {...props} />
      </TooltipProvider>
    </Provider>,
  );

describe('Header snapshots', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should render Header with the file name', () => {
    // before
    const { asFragment } = renderHeader({ name: 'Untitled', onRenameFile: vi.fn() });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Header behaviors', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should show the file name and reveal the field on click', () => {
    // before
    renderHeader({ name: 'Screenshots', onRenameFile: vi.fn() });

    // result
    expect(screen.getByRole('button', { name: 'Rename file' })).toHaveTextContent('Screenshots');

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));

    // result
    expect(screen.getByRole('textbox', { name: 'Rename file' })).toHaveValue('Screenshots');
  });

  it('should call onRenameFile with the committed name', () => {
    // mock
    const onRenameFile = vi.fn();

    // before
    renderHeader({ name: 'Untitled', onRenameFile });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    const field = screen.getByRole('textbox', { name: 'Rename file' });
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);

    // result
    expect(onRenameFile).toHaveBeenCalledWith('Screenshots');
  });

  it('should render the menu and minimize UI buttons', () => {
    // before
    renderHeader({ name: 'Untitled', onRenameFile: vi.fn() });

    // result
    expect(screen.getByRole('button', { name: 'File menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minimize UI' })).toBeInTheDocument();
  });

  it('should hide the menu button while the name is being edited', () => {
    // before
    renderHeader({ name: 'Untitled', onRenameFile: vi.fn() });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));

    // result
    expect(screen.queryByRole('button', { name: 'File menu' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minimize UI' })).toBeInTheDocument();
  });
});
