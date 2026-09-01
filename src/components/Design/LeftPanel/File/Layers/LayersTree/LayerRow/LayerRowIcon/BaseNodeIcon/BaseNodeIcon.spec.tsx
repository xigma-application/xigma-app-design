import { render } from '@testing-library/react';

// components
import BaseNodeIcon from './BaseNodeIcon';

describe('BaseNodeIcon', () => {
  it('renders the named icon at the given size', () => {
    // before
    render(<BaseNodeIcon name="Group" size={12} />);
    const svg = document.querySelector('svg')!;

    // result
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
  });

  it('forwards the given className to the rendered icon', () => {
    // before
    render(<BaseNodeIcon className="my-icon" name="Group" size={12} />);

    // result
    expect(document.querySelector('svg')).toHaveClass('my-icon');
  });

  it('applies the normalized centering transform once the rendered icon geometry is measured', () => {
    // mock
    vi.spyOn(SVGGraphicsElement.prototype, 'getBBox').mockReturnValue({ height: 10, width: 10, x: 3, y: 3 } as DOMRect);

    // before
    render(<BaseNodeIcon name="Group" size={10} />);
    const svg = document.querySelector('svg')!;

    // result
    expect(svg.style.transform).toBe('translate(0px, 0px) scale(1.6)');
    expect(svg.style.transformOrigin).toBe('5px 5px');
  });
});
