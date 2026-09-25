import { render, screen } from '@testing-library/react';

// components
import AvatarBadge from './AvatarBadge';

// others
import { AVATAR_LABEL } from './constants';

describe('AvatarBadge behaviors', () => {
  it('should show the avatar label', () => {
    // before
    render(<AvatarBadge />);

    // result
    expect(screen.getByText(AVATAR_LABEL)).toBeInTheDocument();
  });
});
