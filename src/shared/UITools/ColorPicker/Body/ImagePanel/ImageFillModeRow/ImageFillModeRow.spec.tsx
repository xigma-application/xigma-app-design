import { fireEvent, render, screen } from '@testing-library/react';

// components
import ImageFillModeRow, { TImageFillModeRowProps } from './ImageFillModeRow';
import { TooltipProvider } from 'shared';

const renderImageFillModeRow = (props: Partial<TImageFillModeRowProps> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ImageFillModeRow fillMode="fill" setFillMode={vi.fn()} {...props} />
    </TooltipProvider>,
  );

describe('ImageFillModeRow snapshots', () => {
  it('should render ImageFillModeRow', () => {
    // before
    const { asFragment } = renderImageFillModeRow();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageFillModeRow behaviors', () => {
  it('should show the current fill mode as the dropdown value', () => {
    // before
    renderImageFillModeRow({ fillMode: 'crop' });

    // result
    expect(screen.getByText('Crop')).toBeInTheDocument();
  });

  it('should render the rotate button', () => {
    // before
    renderImageFillModeRow();

    // result
    expect(screen.getByRole('button', { name: 'Rotate image' })).toBeInTheDocument();
  });

  it('should call setFillMode with the picked option when a different fill mode is chosen', () => {
    // mock
    const setFillMode = vi.fn();

    // before
    renderImageFillModeRow({ setFillMode });

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Tile'));

    // result
    expect(setFillMode).toHaveBeenCalledWith('tile');
  });

  it('should call onRotate when the rotate button is clicked', () => {
    // mock
    const onRotate = vi.fn();

    // before
    renderImageFillModeRow({ onRotate });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rotate image' }));

    // result
    expect(onRotate).toHaveBeenCalled();
  });

  it('should show the "Rotate 90°" tooltip on focus', async () => {
    // before
    renderImageFillModeRow();

    // action
    fireEvent.focus(screen.getByLabelText('Rotate image'));

    // result
    expect(await screen.findAllByText('Rotate 90°', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
