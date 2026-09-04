import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';

// components
import ColumnBackgroundColorField from './ColumnBackgroundColorField';
import { TooltipProvider } from 'shared';

const renderColorField = (props: Partial<ComponentProps<typeof ColumnBackgroundColorField>> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ColumnBackgroundColorField alpha={100} hex="#444444" onCommit={vi.fn()} onPickerChange={vi.fn()} {...props} />
    </TooltipProvider>,
  );

describe('ColumnBackgroundColorField snapshots', () => {
  it('should render the swatch trigger and the hex input', () => {
    // before
    const { asFragment } = renderColorField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnBackgroundColorField behaviors', () => {
  it('should seed the input with the hex, without the leading hash', () => {
    // before
    renderColorField();

    // result
    expect(screen.getByDisplayValue('444444')).toBeInTheDocument();
  });

  it('should commit a normalised hex on blur when the typed value is valid', () => {
    // mock
    const onCommit = vi.fn();

    // before
    renderColorField({ onCommit });
    const input = screen.getByDisplayValue('444444');

    // action
    fireEvent.change(input, { target: { value: 'abcdef' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith('#abcdef');
  });

  it('should expose the picker trigger for opening the colour popover', () => {
    // before
    renderColorField();

    // result
    expect(screen.getByLabelText('Background color')).toBeInTheDocument();
  });
});
