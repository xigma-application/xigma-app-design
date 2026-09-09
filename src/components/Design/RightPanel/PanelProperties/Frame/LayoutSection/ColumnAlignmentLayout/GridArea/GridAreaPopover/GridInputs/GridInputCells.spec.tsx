import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridInputCells from './GridInputCells';
import { TooltipProvider } from 'shared';

const renderGridInputCells = (props: Partial<Parameters<typeof GridInputCells>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridInputCells iconName="Columns" onCommit={vi.fn()} value="2" {...props} />
    </TooltipProvider>,
  );

describe('GridInputCells', () => {
  it('should render the field with the current value and a labelled icon', () => {
    renderGridInputCells({ iconName: 'Columns' });

    expect(screen.getByLabelText('Columns')).toHaveValue('2');
  });

  it('should render an empty field without crashing', () => {
    renderGridInputCells({ value: '' });

    expect(screen.getByLabelText('Columns')).toHaveValue('');
  });

  it('should commit the field value on blur', () => {
    const onCommit = vi.fn();

    renderGridInputCells({ onCommit });

    const input = screen.getByLabelText('Columns');

    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith('7');
  });

  it('should commit each step of a scrub drag', () => {
    const onCommit = vi.fn();
    const { container } = renderGridInputCells({ onCommit, value: '2' });
    const scrubber = container.querySelector('[class*="ScrubbableInput"]') as HTMLElement;
    const move = new MouseEvent('mousemove', { bubbles: true, cancelable: true });

    Object.defineProperty(move, 'movementX', { value: 30 });

    fireEvent.mouseDown(scrubber, { clientX: 0, clientY: 0 });
    window.dispatchEvent(move);
    fireEvent.mouseUp(scrubber);

    expect(onCommit).toHaveBeenCalled();
  });

  it('should use the Rows label when configured for rows', () => {
    renderGridInputCells({ iconName: 'Rows' });

    expect(screen.getByLabelText('Rows')).toBeInTheDocument();
  });
});
