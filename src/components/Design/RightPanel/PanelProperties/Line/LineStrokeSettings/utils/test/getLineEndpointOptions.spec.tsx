import { render } from '@testing-library/react';
import { ReactElement } from 'react';

// types
import { LineEndpoint } from 'types/design/enums';

// utils
import { getLineEndpointOptions } from '../getLineEndpointOptions';

describe('getLineEndpointOptions', () => {
  it('should list the caps, then the arrows after a separator', () => {
    // before
    const options = getLineEndpointOptions((endpoint) => endpoint, false);

    // result
    expect(options.map((option) => option.value)).toEqual([
      LineEndpoint.none,
      LineEndpoint.round,
      LineEndpoint.square,
      LineEndpoint.lineArrow,
      LineEndpoint.triangleArrow,
      LineEndpoint.reversedTriangle,
      LineEndpoint.circleArrow,
      LineEndpoint.diamondArrow,
    ]);
    expect(options.filter((option) => option.separatorBefore).map((option) => option.value)).toEqual([LineEndpoint.lineArrow]);
  });

  it('should label each option and flip its icon for an end point', () => {
    // before
    const [option] = getLineEndpointOptions((endpoint) => `label-${endpoint}`, true);
    const { container } = render(option.content as ReactElement);

    // result
    expect(option.label).toBe('label-none');
    expect(container).toHaveTextContent('label-none');
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('flipped');
  });
});
