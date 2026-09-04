import { render, screen } from '@testing-library/react';

// components
import FrameHeaderMenu from './FrameHeaderMenu';

describe('FrameHeaderMenu snapshots', () => {
  it('should render the current element type as a disabled, selected item', () => {
    // before
    const { asFragment } = render(<FrameHeaderMenu />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeaderMenu behaviors', () => {
  it('should render the Frame item', () => {
    // before
    render(<FrameHeaderMenu />);

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });
});
