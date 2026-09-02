import { fireEvent, render, screen } from '@testing-library/react';

// components
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('should render the label', () => {
    // before
    render(<Checkbox label="Show rulers" onChange={vi.fn()} value={false} />);

    // result
    expect(screen.getByText('Show rulers')).toBeInTheDocument();
  });

  it('should call onChange with the toggled value when clicked', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<Checkbox label="Show rulers" onChange={onChange} value={false} />);

    // action
    fireEvent.click(screen.getByRole('checkbox'));

    // result
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should reflect the checked value on the underlying input', () => {
    // before
    render(<Checkbox label="Show rulers" onChange={vi.fn()} value />);

    // result
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
