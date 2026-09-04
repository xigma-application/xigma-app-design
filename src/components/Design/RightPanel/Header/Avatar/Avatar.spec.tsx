import { render, screen } from '@testing-library/react';

// components
import Avatar from './Avatar';
import { TooltipProvider } from 'shared';

// others
import { AVATAR_LABEL } from './AvatarBadge/constants';

const renderAvatar = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Avatar />
    </TooltipProvider>,
  );

describe('Avatar snapshots', () => {
  it('should render Avatar', () => {
    // before
    const { asFragment } = renderAvatar();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Avatar behaviors', () => {
  it('should show the avatar label on the trigger', () => {
    // before
    renderAvatar();

    // result
    expect(screen.getByText(AVATAR_LABEL)).toBeInTheDocument();
  });

  it('should expose an accessible label on the trigger button', () => {
    // before
    renderAvatar();

    // result
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
  });
});
