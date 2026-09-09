import { render } from '@testing-library/react';

// components
import PreviewInsideStroke from './PreviewInsideStroke';

// types
import { InsideStroke } from 'types/design/enums';

describe('PreviewInsideStroke', () => {
  it('should not apply the excluded modifier for the included value', () => {
    // before
    const { container } = render(<PreviewInsideStroke value={InsideStroke.included} />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).toBeNull();
  });

  it('should apply the excluded modifier for the excluded value', () => {
    // before
    const { container } = render(<PreviewInsideStroke value={InsideStroke.excluded} />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).not.toBeNull();
  });
});
