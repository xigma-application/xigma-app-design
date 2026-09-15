import { render, screen } from '@testing-library/react';

// components
import PagesHeaderTitle from './PagesHeaderTitle';

describe('PagesHeaderTitle', () => {
  it('should render the active page name when not expanded', () => {
    // before
    render(<PagesHeaderTitle activePageName="Page 1" isExpanded={false} />);

    // result
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  it('should render the static "Pages" title instead of the page name when expanded', () => {
    // before
    render(<PagesHeaderTitle activePageName="Page 1" isExpanded />);

    // result
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
  });

  it('should rotate the toggle icon via a class instead of swapping icons when expanded', () => {
    // before
    const { container: collapsedContainer } = render(<PagesHeaderTitle activePageName="Page 1" isExpanded={false} />);
    const collapsedIcon = collapsedContainer.querySelector('[data-page-toggle] svg');

    // action
    const { container: expandedContainer } = render(<PagesHeaderTitle activePageName="Page 1" isExpanded />);
    const expandedIcon = expandedContainer.querySelector('[data-page-toggle] svg');

    // result
    expect(collapsedIcon?.querySelector('path')?.getAttribute('d')).toBe(expandedIcon?.querySelector('path')?.getAttribute('d'));
    expect(expandedIcon?.getAttribute('class')).toMatch(/--expanded/);
    expect(collapsedIcon?.getAttribute('class')).not.toMatch(/--expanded/);
  });
});
