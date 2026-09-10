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
  it('should not apply the outline modifier class by default', () => {
    // before
    const { container } = render(<Dropdown onSelect={vi.fn()} options={options} value="hex" />);

    // result
    expect(container.querySelector('[class*="--outline"]')).toBeNull();
  });

  it('should apply the outline modifier class when variant is "outline"', () => {
    // before
    const { container } = render(<Dropdown onSelect={vi.fn()} options={options} value="hex" variant="outline" />);

    // result
    expect(container.querySelector('[class*="--outline"]')).not.toBeNull();
  });

  it('should not disable the trigger by default', () => {
    // before
    render(<Dropdown onSelect={vi.fn()} options={options} value="hex" />);

    // result
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should disable the trigger when disabled is true', () => {
    // before
    render(<Dropdown disabled onSelect={vi.fn()} options={options} value="hex" />);

    // result
    expect(screen.getByRole('button')).toBeDisabled();
  });

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

  it('should call onHoverOption with null while the dropdown is closed', () => {
    // mock
    const onHoverOption = vi.fn();

    // before
    render(<Dropdown onHoverOption={onHoverOption} onSelect={vi.fn()} options={options} value="hex" />);

    // result
    expect(onHoverOption).toHaveBeenCalledWith(null);
  });

  it('should call onHoverOption with the currently selected option value as soon as the dropdown opens', () => {
    // mock
    const onHoverOption = vi.fn();

    // before
    render(<Dropdown onHoverOption={onHoverOption} onSelect={vi.fn()} options={options} value="hex" />);
    onHoverOption.mockClear();

    // action
    fireEvent.click(screen.getByText('Hex'));

    // result
    expect(onHoverOption).toHaveBeenCalledWith('hex');
  });

  it('should call onHoverOption with the hovered option value while the dropdown is open', () => {
    // mock
    const onHoverOption = vi.fn();

    // before
    render(<Dropdown onHoverOption={onHoverOption} onSelect={vi.fn()} options={options} value="hex" />);
    fireEvent.click(screen.getByText('Hex'));
    onHoverOption.mockClear();

    // action
    fireEvent.mouseEnter(screen.getByText('RGB'));

    // result
    expect(onHoverOption).toHaveBeenCalledWith('rgb');
  });

  it('should call onHoverOption with null once the dropdown closes again', () => {
    // mock
    const onHoverOption = vi.fn();

    // before
    render(<Dropdown onHoverOption={onHoverOption} onSelect={vi.fn()} options={options} value="hex" />);
    fireEvent.click(screen.getByText('Hex'));
    onHoverOption.mockClear();

    // action
    fireEvent.click(screen.getByText('RGB'));

    // result
    expect(onHoverOption).toHaveBeenCalledWith(null);
  });

  it('should bypass global keyboard shortcuts on the trigger and the open panel by default', () => {
    // before
    render(<Dropdown onSelect={vi.fn()} options={options} value="hex" />);
    fireEvent.click(screen.getByText('Hex'));

    // result
    expect(screen.getByRole('button')).toHaveAttribute('data-test-bypass-global-shortcuts', 'true');
    expect(screen.getByText('RGB').closest('[data-test-bypass-global-shortcuts]')).not.toBeNull();
  });

  it('should not bypass global keyboard shortcuts when asked not to', () => {
    // before
    render(<Dropdown bypassGlobalShortcuts={false} onSelect={vi.fn()} options={options} value="hex" />);
    fireEvent.click(screen.getByText('Hex'));

    // result
    expect(screen.getByRole('button')).not.toHaveAttribute('data-test-bypass-global-shortcuts');
    expect(screen.getByText('RGB').closest('[data-test-bypass-global-shortcuts]')).toBeNull();
  });
});
