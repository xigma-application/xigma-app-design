import { render } from '@testing-library/react';

// components
import NodeShapeIcon from './NodeShapeIcon';

describe('NodeShapeIcon', () => {
  it('should render the outline as a stroked path with no fill', () => {
    // before
    const { container } = render(<NodeShapeIcon outline={{ d: 'M0 0 L10 10 Z' }} size={10} />);

    // result
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', 'M0 0 L10 10 Z');
    expect(path).toHaveAttribute('fill', 'none');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width');
  });

  it('should size the svg and pass through the className', () => {
    // before
    const { container } = render(<NodeShapeIcon className="my-icon" outline={{ d: 'M0 0 L10 10' }} size={12} />);

    // result
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
    expect(svg).toHaveClass('my-icon');
  });
});
