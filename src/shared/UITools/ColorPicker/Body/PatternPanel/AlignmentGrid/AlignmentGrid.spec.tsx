import { fireEvent, render, screen } from '@testing-library/react';

// components
import AlignmentGrid from './AlignmentGrid';
import { TooltipProvider } from 'shared';

const renderAlignmentGrid = (onChange: TFunc<[number]>, selectedIndex: number): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <AlignmentGrid onChange={onChange} selectedIndex={selectedIndex} />
    </TooltipProvider>,
  );

describe('AlignmentGrid behaviors', () => {
  it('should render nine alignment points', () => {
    // before
    renderAlignmentGrid(vi.fn(), 0);

    // result
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('should mark only the selected point as pressed', () => {
    // before
    renderAlignmentGrid(vi.fn(), 4);

    // result
    const buttons = screen.getAllByRole('button');

    expect(buttons[4]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('should call onChange with the clicked point index', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderAlignmentGrid(onChange, 0);

    // action
    fireEvent.click(screen.getAllByRole('button')[7]);

    // result
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('should give each point a distinct, position-based tooltip', async () => {
    // before
    renderAlignmentGrid(vi.fn(), 0);
    const buttons = screen.getAllByRole('button');

    // action
    fireEvent.focus(buttons[0]);

    // result
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Align top left');
  });

  it('should label the center point distinctly from the corners', async () => {
    // before
    renderAlignmentGrid(vi.fn(), 0);
    const buttons = screen.getAllByRole('button');

    // action
    fireEvent.focus(buttons[4]);

    // result
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Align center');
  });
});
