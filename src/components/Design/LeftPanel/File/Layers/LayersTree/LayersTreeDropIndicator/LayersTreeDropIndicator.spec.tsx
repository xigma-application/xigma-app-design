import { render } from '@testing-library/react';

// components
import LayersTreeDropIndicator from './LayersTreeDropIndicator';

describe('LayersTreeDropIndicator', () => {
  it('should render a dot and a connecting line', () => {
    // before
    const { container } = render(<LayersTreeDropIndicator />);

    // result
    expect(container.querySelector('[class*="__dot"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="__line"]')).toBeInTheDocument();
  });
});
