import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridAreaPopover from './GridAreaPopover';
import { TooltipProvider } from 'shared';

const renderGridAreaPopover = (props: Partial<Parameters<typeof GridAreaPopover>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridAreaPopover
        close={vi.fn()}
        columns="2"
        onClickCell={vi.fn()}
        onCommitColumns={vi.fn()}
        onCommitRows={vi.fn()}
        rows="2"
        {...props}
      />
    </TooltipProvider>,
  );

describe('GridAreaPopover', () => {
  it('should render the count inputs and the pick matrix', () => {
    const { container } = renderGridAreaPopover();

    expect(screen.getByLabelText('Columns')).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="CellsInput__cell"]')).toHaveLength(96);
  });

  it('should pass the close handler down to the matrix', () => {
    const close = vi.fn();
    const onClickCell = vi.fn();
    const { container } = renderGridAreaPopover({ close, onClickCell });

    fireEvent.click(container.querySelector('[data-value="1.1"]') as HTMLElement);

    expect(onClickCell).toHaveBeenCalledWith({ columns: 1, rows: 1 });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
