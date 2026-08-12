import { render, screen } from '@testing-library/react';

// components
import RouteTransitionLoader from './RouteTransitionLoader';

describe('RouteTransitionLoader snapshots', () => {
  it('should render a loading indicator', () => {
    // before
    render(<RouteTransitionLoader />);

    // result
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
