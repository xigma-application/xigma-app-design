import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnDimensionsField from './ColumnDimensionsField';

// types
import { SizingMode } from 'types/design/enums';

const renderColumnDimensionsField = (overrides: Partial<Parameters<typeof ColumnDimensionsField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <ColumnDimensionsField
      ariaLabel="Width"
      axis="width"
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

  it('should render the sizing-mode chevron when a sizing mode is given', () => {
    // before
    const { asFragment } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

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

  it('should not render the sizing-mode chevron when no sizing mode is given', () => {
    // before
    renderColumnDimensionsField();

    // result
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should render the sizing-mode chevron when a sizing mode is given, matching the field axis', () => {
    // before
    renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

    // result
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should render the height sizing-mode chevron for a height axis field', () => {
    // before
    renderColumnDimensionsField({ axis: 'height', onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

    // result
    expect(screen.getByLabelText('Height sizing options')).toBeInTheDocument();
  });
});
