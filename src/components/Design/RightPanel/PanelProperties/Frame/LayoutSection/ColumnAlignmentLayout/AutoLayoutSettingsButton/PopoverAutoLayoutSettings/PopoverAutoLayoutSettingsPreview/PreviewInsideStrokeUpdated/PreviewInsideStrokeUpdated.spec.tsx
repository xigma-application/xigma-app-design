import { render } from '@testing-library/react';

// components
import PreviewInsideStrokeUpdated from './PreviewInsideStrokeUpdated';

// types
import { InsideStroke } from 'types/design/enums';

describe('PreviewInsideStrokeUpdated', () => {
  it('should not apply the excluded modifier for the included value', () => {
    // before
    const { container } = render(<PreviewInsideStrokeUpdated value={InsideStroke.included} />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).toBeNull();
  });

  it('should apply the excluded modifier for the excluded value', () => {
    // before
    const { container } = render(<PreviewInsideStrokeUpdated value={InsideStroke.excluded} />);

    // result
    expect(container.querySelector('[class*="--excluded"]')).not.toBeNull();
  });
});
