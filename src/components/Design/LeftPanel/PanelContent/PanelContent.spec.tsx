import { render, screen } from '@testing-library/react';

// components
import PanelContent from './PanelContent';

// types
import { NavItemName } from '../NavRail/types';

describe('PanelContent snapshots', () => {
  it('should render the File panel for the file nav item', () => {
    // before
    const { asFragment } = render(<PanelContent activeNavItem={NavItemName.file} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render nothing for the other nav items', () => {
    // before
    const { asFragment } = render(<PanelContent activeNavItem={NavItemName.agents} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelContent behaviors', () => {
  it('should show the File panel when the file nav item is active', () => {
    // before
    render(<PanelContent activeNavItem={NavItemName.file} />);

    // result
    expect(screen.getByRole('textbox', { name: 'Rename file' })).toBeInTheDocument();
  });

  it('should not show the File panel for a non-file nav item', () => {
    // before
    render(<PanelContent activeNavItem={NavItemName.tools} />);

    // result
    expect(screen.queryByRole('textbox', { name: 'Rename file' })).not.toBeInTheDocument();
  });
});
