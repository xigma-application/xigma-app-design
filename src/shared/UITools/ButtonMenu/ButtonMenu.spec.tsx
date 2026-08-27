import { fireEvent, render, screen } from '@testing-library/react';

// components
import ButtonMenu from './ButtonMenu';

describe('ButtonMenu snapshots', () => {
  it('should render ButtonMenu with the trigger visible and the menu closed', () => {
    // before
    const { asFragment } = render(
      <ButtonMenu trigger={<span>More</span>}>
        <div>Item</div>
      </ButtonMenu>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ButtonMenu behaviors', () => {
  it('should open the menu and expose data-state="open" on the trigger when clicked', () => {
    // before
    render(
      <ButtonMenu trigger={<span>More</span>}>
        <div>Item</div>
      </ButtonMenu>,
    );

    // action
    fireEvent.click(screen.getByText('More'));

    // result
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('should call onOpenChange when the menu opens', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    render(
      <ButtonMenu onOpenChange={onOpenChange} trigger={<span>More</span>}>
        <div>Item</div>
      </ButtonMenu>,
    );

    // action
    fireEvent.click(screen.getByText('More'));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should pass the current open state to a function trigger', () => {
    // before
    render(<ButtonMenu trigger={(isOpen) => <span>{isOpen ? 'Open' : 'Closed'}</span>}>Item</ButtonMenu>);

    // result
    expect(screen.getByText('Closed')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByText('Closed'));

    // result
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
