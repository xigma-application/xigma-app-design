import { render, screen } from '@testing-library/react';

// components
import TreeDropOverlay from './TreeDropOverlay';

describe('TreeDropOverlay', () => {
  it('should render nothing when not dragging (insertionIndex is null) and not dropping inside', () => {
    // before
    const { container } = render(<TreeDropOverlay dropDepth={0} dropInsideIndex={null} insertionIndex={null} isDefault rowHeight={32} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the insertion-line indicator while dragging outside any row, not dropping inside', () => {
    // before
    const { container } = render(<TreeDropOverlay dropDepth={1} dropInsideIndex={null} insertionIndex={2} isDefault rowHeight={32} />);

    // result
    expect(container.querySelector('[class*="Tree__dropIndicator"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="Tree__dropInsideOutline"]')).not.toBeInTheDocument();
  });

  it('should call renderDropIndicator with the drop depth and render its result inside the indicator', () => {
    // mock
    const renderDropIndicator = vi.fn(() => <span>Custom</span>);

    // before
    render(
      <TreeDropOverlay
        dropDepth={2}
        dropInsideIndex={null}
        insertionIndex={0}
        isDefault={false}
        renderDropIndicator={renderDropIndicator}
        rowHeight={32}
      />,
    );

    // result
    expect(renderDropIndicator).toHaveBeenCalledWith(2);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should render the drop-inside outline instead, positioned by dropInsideIndex, when dropping inside a row', () => {
    // before
    const { container } = render(<TreeDropOverlay dropDepth={0} dropInsideIndex={3} insertionIndex={2} isDefault rowHeight={32} />);

    // result
    expect(container.querySelector('[class*="Tree__dropIndicator"]')).not.toBeInTheDocument();

    const outline = container.querySelector('[class*="Tree__dropInsideOutline"]') as HTMLElement;
    expect(outline).toBeInTheDocument();
    expect(outline.style.transform).toBe('translateY(96px)');
  });
});
