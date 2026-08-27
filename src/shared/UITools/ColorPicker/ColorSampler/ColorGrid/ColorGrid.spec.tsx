import { render } from '@testing-library/react';

// components
import ColorGrid from './ColorGrid';

const COLORS = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 0, r: 0 }));

describe('ColorGrid snapshots', () => {
  it('should render ColorGrid', () => {
    // before
    const { asFragment } = render(<ColorGrid colors={COLORS} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
