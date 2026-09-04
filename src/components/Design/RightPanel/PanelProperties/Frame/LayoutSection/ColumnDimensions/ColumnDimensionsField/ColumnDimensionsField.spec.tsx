import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnDimensionsField from './ColumnDimensionsField';

const renderColumnDimensionsField = (overrides: Partial<Parameters<typeof ColumnDimensionsField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <ColumnDimensionsField
      ariaLabel="Width"
      e2eValue="width"
      label="W"
      onBlur={vi.fn()}
      onDragEnd={vi.fn()}
      onDragStart={vi.fn()}
      onScrub={vi.fn()}
      value={326}
      {...overrides}
    />,
  );

describe('ColumnDimensionsField snapshots', () => {
  it('should render the field with its label and value', () => {
    // before
    const { asFragment } = renderColumnDimensionsField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnDimensionsField behaviors', () => {
  it('should render the label', () => {
    // before
    renderColumnDimensionsField();

    // result
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('should render the current value in the input', () => {
    // before
    renderColumnDimensionsField({ value: 187 });

    // result
    expect(screen.getByLabelText('Width')).toHaveValue(187);
  });

  it('should call onBlur when the input loses focus', () => {
    // mock
    const onBlur = vi.fn();

    // before
    renderColumnDimensionsField({ onBlur });
    const input = screen.getByLabelText('Width');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalled();
  });
});
