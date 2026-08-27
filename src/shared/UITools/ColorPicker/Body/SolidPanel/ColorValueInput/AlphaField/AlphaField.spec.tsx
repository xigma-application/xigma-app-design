import { fireEvent, render } from '@testing-library/react';

// components
import AlphaField from './AlphaField';

describe('AlphaField snapshots', () => {
  it('should render AlphaField', () => {
    // before
    const { asFragment } = render(<AlphaField alpha={50} onCommit={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AlphaField behaviors', () => {
  it('should commit a clamped alpha value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<AlphaField alpha={0} onCommit={onCommit} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith(100);
  });
});
