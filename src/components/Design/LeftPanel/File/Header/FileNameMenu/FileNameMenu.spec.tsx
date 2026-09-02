import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import FileNameMenu from './FileNameMenu';

describe('FileNameMenu', () => {
  it('should render a closed “File menu” trigger button', () => {
    // before
    render(<FileNameMenu onOpenChange={vi.fn()} open={false} />);

    // result
    expect(screen.getByRole('button', { name: 'File menu' })).toHaveAttribute('data-state', 'closed');
  });

  it('should call onOpenChange when the trigger is clicked', async () => {
    // mock
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    // before
    render(<FileNameMenu onOpenChange={onOpenChange} open={false} />);
    await user.click(screen.getByRole('button', { name: 'File menu' }));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should reveal every row with its label and shortcut when open', () => {
    // before
    render(<FileNameMenu onOpenChange={vi.fn()} open />);

    // result
    expect(screen.getByText('Show version history')).toBeInTheDocument();
    expect(screen.getByText('Publish library...')).toBeInTheDocument();
    expect(screen.getByText('Export...')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘E')).toBeInTheDocument();
    expect(screen.getByText('Add to sidebar')).toBeInTheDocument();
    expect(screen.getByText('Create branch...')).toBeInTheDocument();
    expect(screen.getByText('File color profile')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Move file...')).toBeInTheDocument();
    expect(screen.getByText('Move to trash')).toBeInTheDocument();
  });

  it('should disable every flat item but leave the two submenus enabled', () => {
    // before
    render(<FileNameMenu onOpenChange={vi.fn()} open />);

    // result — disabled
    expect(screen.getByText('Show version history').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Publish library...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Export...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Create branch...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Duplicate').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Rename').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Move file...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Move to trash').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');

    // result — submenus, not disabled
    expect(screen.getByText('Add to sidebar').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('File color profile').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
