import { render, screen } from '@testing-library/react';

// components
import PreviewAlignTextBaseline from './PreviewAlignTextBaseline';

// types
import { AlignTextBaseline } from 'types/design/enums';

describe('PreviewAlignTextBaseline', () => {
  it('should render the start and end glyph boxes', () => {
    // before
    render(<PreviewAlignTextBaseline value={AlignTextBaseline.off} />);

    // result
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('g')).toBeInTheDocument();
  });

  it('should not apply the on modifier for the off value', () => {
    // before
    const { container } = render(<PreviewAlignTextBaseline value={AlignTextBaseline.off} />);

    // result
    expect(container.querySelector('[class*="--on"]')).toBeNull();
  });

  it('should apply the on modifier for the on value', () => {
    // before
    const { container } = render(<PreviewAlignTextBaseline value={AlignTextBaseline.on} />);

    // result
    expect(container.querySelector('[class*="--on"]')).not.toBeNull();
  });
});
