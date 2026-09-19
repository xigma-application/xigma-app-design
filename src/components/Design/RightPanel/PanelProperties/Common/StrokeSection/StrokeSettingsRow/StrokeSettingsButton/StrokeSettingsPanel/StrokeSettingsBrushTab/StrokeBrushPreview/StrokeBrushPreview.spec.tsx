import { render, screen } from '@testing-library/react';

// components
import StrokeBrushPreview from './StrokeBrushPreview';

describe('StrokeBrushPreview', () => {
  it('should render the brush image with its label, filling the height of its container', () => {
    // action
    render(<StrokeBrushPreview label="Heist" src="heist.png" />);

    // result
    const image = screen.getByAltText('Heist');

    expect(image).toHaveAttribute('src', 'heist.png');
    expect(image.className).toContain('StrokeBrushPreview');
  });
});
