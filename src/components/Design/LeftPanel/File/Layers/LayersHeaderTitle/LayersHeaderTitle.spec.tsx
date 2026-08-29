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

  it('should render a different toggle icon when expanded', () => {
    // before
    const { container: collapsedContainer } = render(<LayersHeaderTitle isExpanded={false} />);
    const collapsedIcon = collapsedContainer.querySelector('[data-layers-toggle] svg')?.outerHTML;

    // action
    const { container: expandedContainer } = render(<LayersHeaderTitle isExpanded />);
    const expandedIcon = expandedContainer.querySelector('[data-layers-toggle] svg')?.outerHTML;

    // result
    expect(expandedIcon).not.toBe(collapsedIcon);
  });
});
