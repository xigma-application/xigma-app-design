import { render, screen } from '@testing-library/react';

// components
import PreviewCanvasStacking from './PreviewCanvasStacking';

describe('PreviewCanvasStacking', () => {
  it('should render one circle per stacked value', () => {
    // before
    render(<PreviewCanvasStacking value="lastOnTop" />);

    // result
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not apply the first-on-top modifier for the lastOnTop value', () => {
    // before
    const { container } = render(<PreviewCanvasStacking value="lastOnTop" />);

    // result
    expect(container.querySelector('[class*="--first-on-top"]')).toBeNull();
  });

  it('should apply the first-on-top modifier for the firstOnTop value', () => {
    // before
    const { container } = render(<PreviewCanvasStacking value="firstOnTop" />);

    // result
    expect(container.querySelector('[class*="--first-on-top"]')).not.toBeNull();
  });
});
