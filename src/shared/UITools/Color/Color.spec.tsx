import { render } from '@testing-library/react';

// components
import Color from './Color';

describe('Color snapshots', () => {
  it('should render Color at full alpha', () => {
    // before
    const { asFragment } = render(<Color alpha={100} color="#ff0000" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render Color at partial alpha', () => {
    // before
    const { asFragment } = render(<Color alpha={50} color="#0000ff" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
