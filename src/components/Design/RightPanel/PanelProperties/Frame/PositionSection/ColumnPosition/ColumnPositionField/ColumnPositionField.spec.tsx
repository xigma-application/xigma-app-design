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
    renderColumnPositionField({ value: -1010 });

    // result
    expect(screen.getByLabelText('X position')).toHaveValue(-1010);
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
});
