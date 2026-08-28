import { fireEvent, render, screen } from '@testing-library/react';

// components
import NavRail from './NavRail';

// types
import { NavItemName } from './types';

describe('NavRail snapshots', () => {
  it('should render NavRail', () => {
    // before
    const { asFragment } = render(<NavRail activeNavItem={NavItemName.file} onSelectNavItem={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('NavRail behaviors', () => {
  it('should mark the given activeNavItem as checked', () => {
    // before
    render(<NavRail activeNavItem={NavItemName.agents} onSelectNavItem={vi.fn()} />);

    // result
    expect(screen.getByRole('radio', { name: NavItemName.agents })).toBeChecked();
    expect(screen.getByRole('radio', { name: NavItemName.file })).not.toBeChecked();
  });

  it('should call onSelectNavItem with the clicked item’s name', () => {
    // mock
    const onSelectNavItem = vi.fn();

    // before
    render(<NavRail activeNavItem={NavItemName.file} onSelectNavItem={onSelectNavItem} />);

    // action
    fireEvent.click(screen.getByRole('radio', { name: NavItemName.tools }));

    // result
    expect(onSelectNavItem).toHaveBeenCalledWith(NavItemName.tools);
  });

  it('should not call onSelectNavItem when the already-active item is clicked again', () => {
    // mock
    const onSelectNavItem = vi.fn();

    // before
    render(<NavRail activeNavItem={NavItemName.file} onSelectNavItem={onSelectNavItem} />);

    // action
    fireEvent.click(screen.getByRole('radio', { name: NavItemName.file }));

    // result
    expect(onSelectNavItem).not.toHaveBeenCalled();
  });

  it('should show each item’s translated label as visible text under its icon', () => {
    // before
    render(<NavRail activeNavItem={NavItemName.file} onSelectNavItem={vi.fn()} />);

    // result
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should render a clickable logo button', () => {
    // before
    render(<NavRail activeNavItem={NavItemName.file} onSelectNavItem={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'xigma' })).toBeInTheDocument();
  });
});
