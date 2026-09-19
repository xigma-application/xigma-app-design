import { render, screen } from '@testing-library/react';

// components
import StrokeProfilePreview from './StrokeProfilePreview';

// types
import { StrokeProfile } from 'types/design/enums';

describe('StrokeProfilePreview', () => {
  it('should render Uniform as an 80x4 block', () => {
    // action
    render(<StrokeProfilePreview label="Uniform" profile={StrokeProfile.uniform} />);

    // result
    const block = screen.getByRole('img', { name: 'Uniform' });

    expect(block.style.width).toBe('80px');
    expect(block.style.height).toBe('4px');
  });

  it('should render every other profile as an image 80px wide', () => {
    // action
    render(<StrokeProfilePreview label="Wedge" profile={StrokeProfile.wedge} />);

    // result
    const image = screen.getByAltText('Wedge');

    expect(image).toHaveAttribute('width', '80');
    expect(image.getAttribute('src')).toContain('wedge');
  });
});
