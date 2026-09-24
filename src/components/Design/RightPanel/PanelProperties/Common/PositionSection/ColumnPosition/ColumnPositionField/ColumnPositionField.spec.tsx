import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnPositionField from './ColumnPositionField';
import { TooltipProvider } from 'shared';

const renderColumnPositionField = (overrides: Partial<Parameters<typeof ColumnPositionField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ColumnPositionField
        ariaLabel="X position"
        e2eValue="x"
        label="X"
        onBlur={vi.fn()}
        onDragEnd={vi.fn()}
        onDragStart={vi.fn()}
        onScrub={vi.fn()}
        tooltip="X-position"
        displayValue={10}
        value={10}
        {...overrides}
      />
    </TooltipProvider>,
  );

describe('ColumnPositionField snapshots', () => {
  it('should render the field with its label and value', () => {
    // before
    const { asFragment } = renderColumnPositionField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnPositionField behaviors', () => {
  it('should render the label', () => {
    // before
    renderColumnPositionField();

    // result
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('should render the current value in the input', () => {
    // before
    renderColumnPositionField({ displayValue: -1010, value: -1010 });

    // result
    expect(screen.getByLabelText('X position')).toHaveValue(-1010);
  });

  it('should render Mixed as text while the selected layers have different positions', () => {
    // before
    renderColumnPositionField({ displayValue: 'Mixed', value: 10 });

    // result
    expect(screen.getByLabelText('X position')).toHaveValue('Mixed');
  });

  it('should call onBlur when the input loses focus', () => {
    // mock
    const onBlur = vi.fn();

    // before
    renderColumnPositionField({ onBlur });
    const input = screen.getByLabelText('X position');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalled();
  });

  it('should disable the input when disabled is set', () => {
    // before
    renderColumnPositionField({ disabled: true });

    // result
    expect(screen.getByLabelText('X position')).toBeDisabled();
  });
});
