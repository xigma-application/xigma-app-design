import { render } from '@testing-library/react';

// components
import PreviewLayout from './PreviewLayout';

describe('PreviewLayout', () => {
  it('should not apply the legacy modifier for the updated value', () => {
    // before
    const { container } = render(<PreviewLayout value="updated" />);

    // result
    expect(container.querySelector('[class*="--legacy"]')).toBeNull();
  });

  it('should apply the legacy modifier for the legacy value', () => {
    // before
    const { container } = render(<PreviewLayout value="legacy" />);

    // result
    expect(container.querySelector('[class*="--legacy"]')).not.toBeNull();
  });
});
