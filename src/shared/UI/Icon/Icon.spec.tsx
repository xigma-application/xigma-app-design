import { render } from '@testing-library/react';

// components
import Icon from './Icon';

describe('Icon snapshots', () => {
  it('should render Icon', () => {
    // before
    const { asFragment } = render(<Icon name="Close" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Icon behaviors', () => {
  it('should apply the requested size', () => {
    // before
    const { container } = render(<Icon name="Close" size={24} />);

    // find
    const svg = container.querySelector('svg');

    // result
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
