import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridInputs from './GridInputs';
import { TooltipProvider } from 'shared';

const renderGridInputs = (props: Partial<Parameters<typeof GridInputs>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridInputs
        columns="2"
        isRowsAuto={false}
        onCommitColumns={vi.fn()}
        onCommitRows={vi.fn()}
        onSetRowsAuto={vi.fn()}
        onSetRowsFixed={vi.fn()}
        rows="3"
        {...props}
      />
    </TooltipProvider>,
  );

describe('GridInputs', () => {
  it('should render a column field and a row field with their values', () => {
    renderGridInputs();

    expect(screen.getByLabelText('Columns')).toHaveValue('2');
    expect(screen.getByLabelText('Rows')).toHaveValue('3');
  });

  it('should route each field’s blur to its own commit handler', () => {
    const onCommitColumns = vi.fn();
    const onCommitRows = vi.fn();

    renderGridInputs({ onCommitColumns, onCommitRows });

    fireEvent.blur(screen.getByLabelText('Columns'));
    fireEvent.blur(screen.getByLabelText('Rows'));

    expect(onCommitColumns).toHaveBeenCalledWith('2');
    expect(onCommitRows).toHaveBeenCalledWith('3');
  });

  it('should show the auto label in the rows field when the rows are auto', () => {
    renderGridInputs({ isRowsAuto: true });

    expect(screen.getByLabelText('Rows')).toHaveValue('Auto');
  });

  it('should open the row-mode menu and offer the fixed value and Auto', () => {
    renderGridInputs({ isRowsAuto: true, rows: '4' });

    fireEvent.click(screen.getByLabelText('Row count options'));

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getAllByText('Auto').length).toBeGreaterThan(0);
  });

  it('should switch the rows to a fixed count from the menu', () => {
    const onSetRowsFixed = vi.fn();

    renderGridInputs({ isRowsAuto: true, onSetRowsFixed, rows: '4' });

    fireEvent.click(screen.getByLabelText('Row count options'));
    fireEvent.click(screen.getByText('4'));

    expect(onSetRowsFixed).toHaveBeenCalledTimes(1);
  });

  it('should switch the rows back to auto from the menu', () => {
    const onSetRowsAuto = vi.fn();

    renderGridInputs({ isRowsAuto: false, onSetRowsAuto });

    fireEvent.click(screen.getByLabelText('Row count options'));
    fireEvent.click(screen.getByText('Auto'));

    expect(onSetRowsAuto).toHaveBeenCalledTimes(1);
  });
});
