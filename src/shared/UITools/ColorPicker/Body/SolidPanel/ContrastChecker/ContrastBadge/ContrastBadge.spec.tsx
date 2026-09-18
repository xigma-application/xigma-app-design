import { render, screen } from '@testing-library/react';

// components
import ContrastBadge from './ContrastBadge';

describe('ContrastBadge', () => {
  it('should show the checkmark icon when passing', () => {
    // before
    const { container } = render(<ContrastBadge label="AA" passes />);

    // result
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should not show the checkmark icon when failing', () => {
    // before
    const { container } = render(<ContrastBadge label="AA" passes={false} />);

    // result
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });
});
