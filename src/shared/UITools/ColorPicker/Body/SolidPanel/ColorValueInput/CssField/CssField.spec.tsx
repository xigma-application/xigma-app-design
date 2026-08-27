import { fireEvent, render } from '@testing-library/react';

// components
import CssField from './CssField';

describe('CssField snapshots', () => {
  it('should render CssField', () => {
    // before
    const { asFragment } = render(<CssField onCommit={vi.fn()} value="rgba(255, 0, 0, 1)" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('CssField behaviors', () => {
  it('should commit a parsed color on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<CssField onCommit={onCommit} value="rgba(255, 0, 0, 1)" />);
    const input = container.querySelector('input') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: 'rgba(13, 153, 255, 0.5)' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith({ alpha: 50, hex: '#0d99ff' });
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<CssField onCommit={onCommit} value="rgba(255, 0, 0, 1)" />);
    const input = container.querySelector('input') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('rgba(255, 0, 0, 1)');
  });
});
