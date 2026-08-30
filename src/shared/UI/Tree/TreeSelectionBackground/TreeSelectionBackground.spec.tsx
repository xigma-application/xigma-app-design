import { render } from '@testing-library/react';

// components
import TreeSelectionBackground from './TreeSelectionBackground';

// types
import { TSelectionBackgroundSegment } from '../utils/getSelectionBackgroundSegments';

const buildSegment = (overrides: Partial<TSelectionBackgroundSegment> = {}): TSelectionBackgroundSegment => ({
  isRoundedBottom: true,
  isRoundedTop: true,
  size: 32,
  start: 0,
  ...overrides,
});

describe('TreeSelectionBackground', () => {
  it('should render one element per segment', () => {
    // before
    const { container } = render(<TreeSelectionBackground segments={[buildSegment({ start: 0 }), buildSegment({ start: 32 })]} />);

    // result
    expect(container.querySelectorAll('[class*="Tree__selectionBackground"]')).toHaveLength(2);
  });

  it('should render nothing when there are no segments', () => {
    // before
    const { container } = render(<TreeSelectionBackground segments={[]} />);

    // result
    expect(container.querySelector('[class*="Tree__selectionBackground"]')).not.toBeInTheDocument();
  });

  it('should square the top edge when the segment is not rounded on top', () => {
    // before
    const { container } = render(<TreeSelectionBackground segments={[buildSegment({ isRoundedTop: false })]} />);

    // result
    expect(container.querySelector('[class*="squareTop"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="squareBottom"]')).not.toBeInTheDocument();
  });

  it('should square the bottom edge when the segment is not rounded on bottom', () => {
    // before
    const { container } = render(<TreeSelectionBackground segments={[buildSegment({ isRoundedBottom: false })]} />);

    // result
    expect(container.querySelector('[class*="squareBottom"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="squareTop"]')).not.toBeInTheDocument();
  });
});
