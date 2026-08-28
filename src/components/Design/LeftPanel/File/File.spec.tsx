import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import File from './File';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderFile = (name: string, onRenameFile: TFunc<[string]>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <File name={name} onRenameFile={onRenameFile} />
      </TooltipProvider>
    </Provider>,
  );

describe('File snapshots', () => {
  it('should render File', () => {
    // before
    const { asFragment } = renderFile('Untitled', vi.fn());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('File behaviors', () => {
  it('should show the given file name', () => {
    // before
    renderFile('Untitled', vi.fn());

    // result
    expect(screen.getByRole('button', { name: 'Rename file' })).toHaveTextContent('Untitled');
  });

  it('should call onRenameFile with the committed name', () => {
    // mock
    const onRenameFile = vi.fn();

    // before
    renderFile('Untitled', onRenameFile);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    const field = screen.getByRole('textbox', { name: 'Rename file' });
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);

    // result
    expect(onRenameFile).toHaveBeenCalledWith('Screenshots');
  });
});
