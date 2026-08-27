import { render, screen } from '@testing-library/react';

// components
import ColorPrompt from './ColorPrompt';

describe('ColorPrompt snapshots', () => {
  it('should render the sampling prompt', () => {
    // before
    render(<ColorPrompt />);

    // result
    expect(screen.getByText('Click to sample')).toBeInTheDocument();
  });
});
