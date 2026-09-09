import { render } from '@testing-library/react';

// components
import PreviewAutoSpacing from './PreviewAutoSpacing';

describe('PreviewAutoSpacing', () => {
  it('should render three spacing boxes, each in its own wrapper', () => {
    // before
    const { container } = render(<PreviewAutoSpacing value="between" />);

    // action
    const wrappers = container.querySelectorAll('[class*="box-wrapper"]');

    // result
    expect(wrappers).toHaveLength(3);
    wrappers.forEach((wrapper) => {
      expect(wrapper.querySelectorAll('[class*="__box"]')).toHaveLength(1);
    });
  });

  it('should not apply a modifier class for the between value', () => {
    // before
    const { container } = render(<PreviewAutoSpacing value="between" />);

    // result
    expect(container.querySelector('[class*="--between"]')).toBeNull();
    expect(container.querySelector('[class*="--around"]')).toBeNull();
    expect(container.querySelector('[class*="--evenly"]')).toBeNull();
  });

  it('should apply the around modifier class for the around value', () => {
    // before
    const { container } = render(<PreviewAutoSpacing value="around" />);

    // result
    expect(container.querySelector('[class*="--around"]')).not.toBeNull();
  });

  it('should apply the evenly modifier class for the evenly value', () => {
    // before
    const { container } = render(<PreviewAutoSpacing value="evenly" />);

    // result
    expect(container.querySelector('[class*="--evenly"]')).not.toBeNull();
  });
});
