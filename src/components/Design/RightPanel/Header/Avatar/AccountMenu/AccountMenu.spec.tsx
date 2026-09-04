import { render, screen } from '@testing-library/react';

// components
import AccountMenu from './AccountMenu';

// others
import { CURRENT_USER_NAME } from './constants';

describe('AccountMenu snapshots', () => {
  it('should render AccountMenu', () => {
    // before
    const { asFragment } = render(<AccountMenu />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AccountMenu behaviors', () => {
  it('should show the current user name', () => {
    // before
    render(<AccountMenu />);

    // result
    expect(screen.getByText(CURRENT_USER_NAME)).toBeInTheDocument();
  });

  it('should render the spotlight and audio-chat actions', () => {
    // before
    render(<AccountMenu />);

    // result
    expect(screen.getByText('Spotlight me')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start audio chat' })).toBeInTheDocument();
  });
});
