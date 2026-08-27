import { fireEvent, render, screen } from '@testing-library/react';

// components
import Dropdown from './Dropdown';

const options = [
  { label: 'Hex', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
];

describe('Dropdown snapshots', () => {
  it('should render Dropdown showing the selected option label', () => {
    // before
    const { asFragment } = render(<Dropdown onSelect={vi.fn()} options={options} value="hex" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Dropdown behaviors', () => {
  it('should call onSelect with the chosen option value', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(<Dropdown onSelect={onSelect} options={options} value="hex" />);

    // action
    fireEvent.click(screen.getByText('Hex'));
    fireEvent.click(screen.getByText('RGB'));

    // result
    expect(onSelect).toHaveBeenCalledWith('rgb');
  });

  it('should move the highlight with arrow keys and only commit on Enter', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(<Dropdown onSelect={onSelect} options={options} value="hex" />);
    fireEvent.click(screen.getByText('Hex'));

    // action
    fireEvent.keyDown(screen.getByText('RGB'), { key: 'ArrowDown' });

    // result — moving the highlight alone must not commit anything yet
    expect(onSelect).not.toHaveBeenCalled();

    // action
    fireEvent.keyDown(screen.getByText('RGB'), { key: 'Enter' });

    // result
    expect(onSelect).toHaveBeenCalledWith('rgb');
  });
});
