import { render } from '@testing-library/react';

// components
import FillDropIndicator from './FillDropIndicator';

describe('FillDropIndicator snapshots', () => {
  it('should render FillDropIndicator', () => {
    // before
    const { asFragment } = render(<FillDropIndicator offset={0} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FillDropIndicator behaviors', () => {
  it('should translate by the given pixel offset', () => {
    // before
    const { container } = render(<FillDropIndicator offset={108} />);

    // find
    const indicator = container.firstChild as HTMLElement;

    // result
    expect(indicator).toHaveStyle({ transform: 'translateY(108px)' });
  });
});
