import { render } from '@testing-library/react';

// components
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage snapshots', () => {
  it('should render NotFoundPage', () => {
    // before
    const { asFragment } = render(<NotFoundPage />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
