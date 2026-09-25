import { render } from '@testing-library/react';

// components
import LineEndpointLabel from './LineEndpointLabel';

describe('LineEndpointLabel snapshots', () => {
  it('should render the endpoint icon with its label', () => {
    // before
    const { asFragment } = render(<LineEndpointLabel icon="StrokeCapRound" isFlipped={false} label="Round" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the icon turned around for an end point', () => {
    // before
    const { asFragment } = render(<LineEndpointLabel icon="StrokeCapTriangleArrow" isFlipped label="Triangle arrow" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
