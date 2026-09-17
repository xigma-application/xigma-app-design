import { render, screen } from '@testing-library/react';

// components
import ImageCropHeader from './ImageCropHeader';
import { TooltipProvider } from 'shared';

const renderImageCropHeader = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ImageCropHeader />
    </TooltipProvider>,
  );

describe('ImageCropHeader snapshots', () => {
  it('should render the Image label with no buttons', () => {
    // before
    const { asFragment } = renderImageCropHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageCropHeader behaviors', () => {
  it('should render the Image label', () => {
    // before
    renderImageCropHeader();

    // result
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should not render a create component button or an element type menu', () => {
    // before
    renderImageCropHeader();

    // result
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });
});
