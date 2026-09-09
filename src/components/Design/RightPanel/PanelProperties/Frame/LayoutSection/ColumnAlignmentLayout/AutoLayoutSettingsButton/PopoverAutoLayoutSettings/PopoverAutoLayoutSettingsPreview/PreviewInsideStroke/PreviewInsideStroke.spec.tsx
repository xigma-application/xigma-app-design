import { render } from '@testing-library/react';

// components
import PreviewInsideStroke from './PreviewInsideStroke';

describe('PreviewInsideStroke', () => {
  it('should not apply the excluded modifier for the included value', () => {
    // before
    const { container } = render(<PreviewInsideStroke value="included" />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).toBeNull();
  });

  it('should apply the excluded modifier for the excluded value', () => {
    // before
    const { container } = render(<PreviewInsideStroke value="excluded" />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).not.toBeNull();
  });
});
