import { fireEvent, render } from '@testing-library/react';

// components
import HexField from './HexField';

describe('HexField snapshots', () => {
  it('should render HexField without the leading #', () => {
    // before
    const { asFragment } = render(<HexField hex="#ff0000" onCommit={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('HexField behaviors', () => {
  it('should commit a normalized hex value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<HexField hex="#ff0000" onCommit={onCommit} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: '00ff00' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith('#00ff00');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<HexField hex="#ff0000" onCommit={onCommit} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('ff0000');
  });
});
