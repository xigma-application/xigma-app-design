import { render, screen } from '@testing-library/react';

// components
import ImageSourcePreview from './ImageSourcePreview';

describe('ImageSourcePreview snapshots', () => {
  it('should render ImageSourcePreview', () => {
    // before
    const { asFragment } = render(<ImageSourcePreview />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageSourcePreview behaviors', () => {
  it('should render the upload-from-computer button', () => {
    // before
    render(<ImageSourcePreview />);

    // result
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
  });

  it('should render the make-an-image button', () => {
    // before
    render(<ImageSourcePreview />);

    // result
    expect(screen.getByRole('button', { name: 'Make an image' })).toBeInTheDocument();
  });
});
