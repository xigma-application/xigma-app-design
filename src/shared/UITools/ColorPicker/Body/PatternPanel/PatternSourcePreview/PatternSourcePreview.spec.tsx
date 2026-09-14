import { render, screen } from '@testing-library/react';

// components
import PatternSourcePreview from './PatternSourcePreview';

describe('PatternSourcePreview snapshots', () => {
  it('should render PatternSourcePreview', () => {
    // before
    const { asFragment } = render(<PatternSourcePreview />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PatternSourcePreview behaviors', () => {
  it('should render the select-source button with its label', () => {
    // before
    render(<PatternSourcePreview />);

    // result
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
  });
});
