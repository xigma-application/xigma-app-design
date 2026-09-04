import { fireEvent, render, screen } from '@testing-library/react';

// components
import Checkbox from './Checkbox';

const renderCheckbox = (overrides: Partial<Parameters<typeof Checkbox>[0]> = {}): ReturnType<typeof render> =>
  render(<Checkbox label="Clip content" onChange={vi.fn()} value={false} {...overrides} />);

describe('Checkbox snapshots', () => {
  it('should render the unchecked state', () => {
    // before
    const { asFragment } = renderCheckbox();

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the checked state', () => {
    // before
    const { asFragment } = renderCheckbox({ value: true });

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the mixed state', () => {
    // before
    const { asFragment } = renderCheckbox({ isMixed: true });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Checkbox behaviors', () => {
  it('should render the label', () => {
    // before
    renderCheckbox();

    // result
    expect(screen.getByText('Clip content')).toBeInTheDocument();
  });

  it('should reflect the checked state', () => {
    // before
    renderCheckbox({ value: true });

    // result
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should call onChange with the next value when clicked', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderCheckbox({ onChange, value: false });

    // action
    fireEvent.click(screen.getByRole('checkbox'));

    // result
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
