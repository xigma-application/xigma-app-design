import { render, screen } from '@testing-library/react';

// components
import TreeDropIndicator from './TreeDropIndicator';

describe('TreeDropIndicator', () => {
  it('should render its children', () => {
    // before
    render(
      <TreeDropIndicator insertionIndex={0} isDefault={false} rowHeight={32}>
        <span>Custom content</span>
      </TreeDropIndicator>,
    );

    // result
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should render the default-line class when isDefault is true', () => {
    // before
    const { container } = render(<TreeDropIndicator insertionIndex={0} isDefault rowHeight={32} />);

    // result
    expect(container.querySelector('[class*="dropIndicator--default"]')).toBeInTheDocument();
  });

  it('should not render the default-line class when isDefault is false', () => {
    // before
    const { container } = render(<TreeDropIndicator insertionIndex={0} isDefault={false} rowHeight={32} />);

    // result
    expect(container.querySelector('[class*="dropIndicator--default"]')).not.toBeInTheDocument();
  });

  it('should position itself via translateY based on the insertion index and row height', () => {
    // before
    const { container } = render(<TreeDropIndicator insertionIndex={3} isDefault={false} rowHeight={32} />);

    // result
    const indicator = container.querySelector('[class*="Tree__dropIndicator"]') as HTMLElement;
    expect(indicator.style.transform).toBe('translateY(96px)');
  });
});
