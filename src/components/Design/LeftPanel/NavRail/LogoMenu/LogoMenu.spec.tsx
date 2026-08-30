import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import LogoMenu from './LogoMenu';

describe('LogoMenu', () => {
  it('should render a closed “xigma” trigger button', () => {
    // before
    render(<LogoMenu />);

    // result
    const trigger = screen.getByRole('button', { name: 'xigma' });
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('should mark the trigger active and reveal the menu content when clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(<LogoMenu />);
    const trigger = screen.getByRole('button', { name: 'xigma' });
    await user.click(trigger);

    // result
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Back to files')).toBeInTheDocument();
    expect(screen.getByText('Actions...')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Object')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Arrange')).toBeInTheDocument();
    expect(screen.getByText('Vector')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Open in desktop app')).toBeInTheDocument();
    expect(screen.getByText('AI balance')).toBeInTheDocument();
    expect(screen.getByText('Help and account')).toBeInTheDocument();
  });

  it('should disable the not-yet-implemented flat items but leave the expandable ones enabled', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(<LogoMenu />);
    await user.click(screen.getByRole('button', { name: 'xigma' }));

    // result — disabled
    expect(screen.getByText('Back to files').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Preferences').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');

    // result — expandable, not disabled
    expect(screen.getByText('File').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Plugins').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Widgets').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Help and account').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
