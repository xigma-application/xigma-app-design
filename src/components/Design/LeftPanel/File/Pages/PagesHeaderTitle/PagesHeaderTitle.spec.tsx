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
});
