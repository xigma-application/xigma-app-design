import { render } from '@testing-library/react';

// components
import PopoverSeparator from './PopoverSeparator';

describe('PopoverSeparator snapshots', () => {
  it('should render PopoverSeparator', () => {
    // before
    const { asFragment } = render(<PopoverSeparator />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
