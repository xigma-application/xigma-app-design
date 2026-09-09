import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridInputs from './GridInputs';
import { TooltipProvider } from 'shared';

const renderGridInputs = (props: Partial<Parameters<typeof GridInputs>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridInputs columns="2" onCommitColumns={vi.fn()} onCommitRows={vi.fn()} rows="3" {...props} />
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
});
