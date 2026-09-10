import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridArea from './GridArea';
import { TooltipProvider } from 'shared';

// hooks
import { TUseColumnGridAreaResult } from '../hooks/useColumnGridArea';

const grid = (overrides: Partial<TUseColumnGridAreaResult> = {}): TUseColumnGridAreaResult => ({
  columns: '2',
  isRowsAuto: false,
  onClickCell: vi.fn(),
  onCommitColumns: vi.fn(),
  onCommitRows: vi.fn(),
  onOpenSettings: vi.fn(),
  onSetRowsAuto: vi.fn(),
  onSetRowsFixed: vi.fn(),
  rows: '3',
  ...overrides,
});

const renderGridArea = (gridOverrides: Partial<TUseColumnGridAreaResult> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridArea grid={grid(gridOverrides)} />
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
