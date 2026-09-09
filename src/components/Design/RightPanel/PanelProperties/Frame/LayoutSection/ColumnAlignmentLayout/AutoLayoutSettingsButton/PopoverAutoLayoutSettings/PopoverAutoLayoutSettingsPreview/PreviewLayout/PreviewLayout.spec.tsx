import { render } from '@testing-library/react';

// components
import PreviewLayout from './PreviewLayout';

// types
import { LayoutVersion } from 'types/design/enums';

describe('PreviewLayout', () => {
  it('should not apply the legacy modifier for the updated value', () => {
    // before
    const { container } = render(<PreviewLayout value={LayoutVersion.updated} />);

    // result
    expect(container.querySelector('[class*="--legacy"]')).toBeNull();
  });

  it('should apply the legacy modifier for the legacy value', () => {
    // before
    const { container } = render(<PreviewLayout value={LayoutVersion.legacy} />);

    // result
    expect(container.querySelector('[class*="--legacy"]')).not.toBeNull();
  });
});
