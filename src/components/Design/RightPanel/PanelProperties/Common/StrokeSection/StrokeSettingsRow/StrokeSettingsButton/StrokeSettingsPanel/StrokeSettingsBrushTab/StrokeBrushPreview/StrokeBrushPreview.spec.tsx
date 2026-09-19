import { render, screen } from '@testing-library/react';

// components
import StrokeBrushPreview from './StrokeBrushPreview';

describe('StrokeBrushPreview', () => {
  it('should render the brush image with its label and the preview width', () => {
    // action
    render(<StrokeBrushPreview label="Heist" src="heist.png" />);

    // result
    const image = screen.getByAltText('Heist');

    expect(image).toHaveAttribute('src', 'heist.png');
    expect(image).toHaveAttribute('width', '144');
  });
});
