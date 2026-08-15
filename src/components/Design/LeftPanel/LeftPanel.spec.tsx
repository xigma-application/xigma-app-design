import { render } from '@testing-library/react';

// components
import LeftPanel from './LeftPanel';

describe('LeftPanel snapshots', () => {
  it('should render LeftPanel', () => {
    // before
    const { asFragment } = render(<LeftPanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
