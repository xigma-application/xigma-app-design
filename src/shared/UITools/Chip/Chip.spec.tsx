import { render, screen } from '@testing-library/react';

// components
import Chip from './Chip';

describe('Chip snapshots', () => {
  it('should render Chip with its default (free) variant', () => {
    // before
    const { asFragment } = render(<Chip>Free</Chip>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Chip behaviors', () => {
  it('should render its children', () => {
    // before
    render(<Chip>Free</Chip>);

    // result
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should merge a caller-supplied className', () => {
    // before
    render(<Chip className="extra">Free</Chip>);

    // result
    expect(screen.getByText('Free')).toHaveClass('extra');
  });
});
