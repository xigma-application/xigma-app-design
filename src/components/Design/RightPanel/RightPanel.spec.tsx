import { render } from '@testing-library/react';

// components
import RightPanel from './RightPanel';

describe('RightPanel snapshots', () => {
  it('should render RightPanel', () => {
    // before
    const { asFragment } = render(<RightPanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
