import { fireEvent, render, screen } from '@testing-library/react';

// components
import FillImagePreview from './FillImagePreview';

// types
import { TImagePaint } from 'types/design/paint/types';

const IMAGE_PAINT: TImagePaint = { opacity: 100, ref: 'image-1', scaleMode: 'fill', type: 'image' };

describe('FillImagePreview snapshots', () => {
  it('should render FillImagePreview', () => {
    // before
    const { asFragment } = render(<FillImagePreview isVisible onToggleVisible={vi.fn()} paint={IMAGE_PAINT} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FillImagePreview behaviors', () => {
  it('should show the gradient label and an open-eye icon when visible', () => {
    // before
    render(<FillImagePreview isVisible onToggleVisible={vi.fn()} paint={IMAGE_PAINT} />);

    // result
    expect(screen.getByText('Gradient')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide fill' })).toBeInTheDocument();
  });

  it('should show a closed-eye icon and the show-fill label when hidden', () => {
    // before
    render(<FillImagePreview isVisible={false} onToggleVisible={vi.fn()} paint={IMAGE_PAINT} />);

    // result
    expect(screen.getByRole('button', { name: 'Show fill' })).toBeInTheDocument();
  });

  it('should call onToggleVisible when the toggle button is clicked', () => {
    // mock
    const onToggleVisible = vi.fn();

    // before
    render(<FillImagePreview isVisible onToggleVisible={onToggleVisible} paint={IMAGE_PAINT} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hide fill' }));

    // result
    expect(onToggleVisible).toHaveBeenCalledTimes(1);
  });
});
