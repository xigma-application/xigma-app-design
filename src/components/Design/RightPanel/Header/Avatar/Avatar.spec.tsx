import { render, screen } from '@testing-library/react';

// components
import Avatar from './Avatar';

// others
import { AVATAR_LABEL } from './AvatarBadge/constants';

describe('Avatar snapshots', () => {
  it('should render Avatar', () => {
    // before
    const { asFragment } = render(<Avatar />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Avatar behaviors', () => {
  it('should show the avatar label on the trigger', () => {
    // before
    render(<Avatar />);

    // result
    expect(screen.getByText(AVATAR_LABEL)).toBeInTheDocument();
  });

  it('should expose an accessible label on the trigger button', () => {
    // before
    render(<Avatar />);

    // result
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
  });
});
