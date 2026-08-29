import { render } from '@testing-library/react';

// components
import LayersTreeDropIndicator from './LayersTreeDropIndicator';

describe('LayersTreeDropIndicator', () => {
  it('should render the line element, with the dot drawn as its ::after pseudo-element', () => {
    // before
    const { container } = render(<LayersTreeDropIndicator />);

    // result
    expect(container.querySelector('[class*="LayersTreeDropIndicator"]')).toBeInTheDocument();
  });
});
