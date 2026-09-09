import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridArea from './GridArea';
import { TooltipProvider } from 'shared';

const renderGridArea = (props: Partial<Parameters<typeof GridArea>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridArea columns="2" onClickCell={vi.fn()} onCommitColumns={vi.fn()} onCommitRows={vi.fn()} rows="3" {...props} />
    </TooltipProvider>,
  );

describe('GridArea', () => {
  it('should render the preview tile with the current size caption', () => {
    const { container } = renderGridArea();

    expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument();
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('3');
  });

  it('should open the popover with the count inputs when the tile is clicked', () => {
    renderGridArea();

    expect(screen.queryByLabelText('Columns')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Grid' }));

    expect(screen.getByLabelText('Columns')).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toBeInTheDocument();
  });

  it('should close the popover after a matrix cell is picked', () => {
    const onClickCell = vi.fn();

    renderGridArea({ onClickCell });

    fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
    fireEvent.click(document.querySelector('[data-value="2.2"]') as HTMLElement);

    expect(onClickCell).toHaveBeenCalledWith({ columns: 2, rows: 2 });
    expect(screen.queryByLabelText('Columns')).not.toBeInTheDocument();
  });
});
