import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridAreaPopover from './GridAreaPopover';
import { TooltipProvider } from 'shared';

// hooks
import { TUseColumnGridAreaResult } from '../../hooks/useColumnGridArea';

const grid = (overrides: Partial<TUseColumnGridAreaResult> = {}): TUseColumnGridAreaResult => ({
  columns: '2',
  isRowsAuto: false,
  onClickCell: vi.fn(),
  onCommitColumns: vi.fn(),
  onCommitRows: vi.fn(),
  onOpenSettings: vi.fn(),
  onSetRowsAuto: vi.fn(),
  onSetRowsFixed: vi.fn(),
  rows: '2',
  ...overrides,
});

const renderGridAreaPopover = (
  props: Partial<Parameters<typeof GridAreaPopover>[0]> = {},
  gridOverrides: Partial<TUseColumnGridAreaResult> = {},
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridAreaPopover close={vi.fn()} grid={grid(gridOverrides)} {...props} />
    </TooltipProvider>,
  );

describe('GridAreaPopover', () => {
  it('should render the count inputs, the pick matrix and an inert grid-settings button', () => {
    const { container } = renderGridAreaPopover();

    expect(screen.getByLabelText('Columns')).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="CellsInput__cell"]')).toHaveLength(96);

    const settingsButton = screen.getByRole('button', { name: 'Open grid settings' });

    expect(settingsButton).toBeEnabled();
    fireEvent.click(settingsButton);
  });

  it('should pass the close handler down to the matrix', () => {
    const close = vi.fn();
    const onClickCell = vi.fn();
    const { container } = renderGridAreaPopover({ close }, { onClickCell });

    fireEvent.click(container.querySelector('[data-value="1.1"]') as HTMLElement);

    expect(onClickCell).toHaveBeenCalledWith({ columns: 1, rows: 1 });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
