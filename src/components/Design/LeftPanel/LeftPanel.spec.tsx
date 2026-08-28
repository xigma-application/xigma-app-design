import { fireEvent, render, screen } from '@testing-library/react';

// components
import LeftPanel from './LeftPanel';

// types
import { NavItemName } from './NavRail/types';

describe('LeftPanel snapshots', () => {
  it('should render LeftPanel', () => {
    // before
    const { asFragment } = render(<LeftPanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LeftPanel behaviors', () => {
  it('should own the active nav item state and reflect a click back onto NavRail', () => {
    // before
    render(<LeftPanel />);

    // action
    fireEvent.click(screen.getByRole('radio', { name: NavItemName.variables }));

    // result
    expect(screen.getByRole('radio', { name: NavItemName.variables })).toBeChecked();
    expect(screen.getByRole('radio', { name: NavItemName.file })).not.toBeChecked();
  });
});
