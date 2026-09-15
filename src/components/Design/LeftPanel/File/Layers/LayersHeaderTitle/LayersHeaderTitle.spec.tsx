import { render, screen } from '@testing-library/react';

// components
import LayersHeaderTitle from './LayersHeaderTitle';

describe('LayersHeaderTitle', () => {
  it('should render the "Layers" title regardless of expanded state', () => {
    // before
    render(<LayersHeaderTitle isExpanded={false} />);

    // result
    expect(screen.getByText('Layers')).toBeInTheDocument();
  });

  it('should rotate the toggle icon via a class instead of swapping icons when expanded', () => {
    // before
    const { container: collapsedContainer } = render(<LayersHeaderTitle isExpanded={false} />);
    const collapsedIcon = collapsedContainer.querySelector('[data-layers-toggle] svg');

    // action
    const { container: expandedContainer } = render(<LayersHeaderTitle isExpanded />);
    const expandedIcon = expandedContainer.querySelector('[data-layers-toggle] svg');

    // result
    expect(collapsedIcon?.querySelector('path')?.getAttribute('d')).toBe(expandedIcon?.querySelector('path')?.getAttribute('d'));
    expect(expandedIcon?.getAttribute('class')).toMatch(/--expanded/);
    expect(collapsedIcon?.getAttribute('class')).not.toMatch(/--expanded/);
  });
});
