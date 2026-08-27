import { fireEvent, render } from '@testing-library/react';

// components
import ChannelFields from './ChannelFields';

const channels = [
  { key: 'r', max: 255 },
  { key: 'g', max: 255 },
  { key: 'b', max: 255 },
];

describe('ChannelFields snapshots', () => {
  it('should render one input per channel', () => {
    // before
    const { asFragment } = render(<ChannelFields channels={channels} onCommit={vi.fn()} values={{ b: 0, g: 128, r: 255 }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ChannelFields behaviors', () => {
  it('should commit the changed channel while preserving the others', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { container } = render(<ChannelFields channels={channels} onCommit={onCommit} values={{ b: 0, g: 128, r: 255 }} />);
    const inputs = container.querySelectorAll('input');

    // action
    fireEvent.change(inputs[2], { target: { value: '200' } });
    fireEvent.blur(inputs[2]);

    // result
    expect(onCommit).toHaveBeenCalledWith({ b: 200, g: 128, r: 255 });
  });
});
