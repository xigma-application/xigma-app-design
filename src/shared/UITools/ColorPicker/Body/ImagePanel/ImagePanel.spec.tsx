import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// components
import ImagePanel, { TImagePanelProps } from './ImagePanel';
import { TooltipProvider } from 'shared';

// hooks
import { useImagePanel } from './hooks/useImagePanel';

// store
import { store } from 'store';

const ImagePanelWrapper = ({ onRotate }: Pick<TImagePanelProps, 'onRotate'>): ReactNode => {
  const imagePanel = useImagePanel();

  return <ImagePanel imagePanel={imagePanel} onRotate={onRotate} />;
};

const renderImagePanel = (onRotate?: TFunc): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImagePanelWrapper onRotate={onRotate} />
      </TooltipProvider>
    </Provider>,
  );

describe('ImagePanel snapshots', () => {
  it('should render ImagePanel', () => {
    // before
    const { asFragment } = renderImagePanel();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImagePanel behaviors', () => {
  it('should render the fill-mode dropdown, the source preview, and the adjustment sliders', () => {
    // before
    renderImagePanel();

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Exposure' })).toBeInTheDocument();
  });

  it('should switch the dropdown to the picked fill mode', () => {
    // before
    renderImagePanel();

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Tile'));

    // result
    expect(screen.getByText('Tile')).toBeInTheDocument();
  });

  it('should call onRotate when the rotate button is clicked', () => {
    // mock
    const onRotate = vi.fn();

    // before
    renderImagePanel(onRotate);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rotate image' }));

    // result
    expect(onRotate).toHaveBeenCalled();
  });

  it('should update a slider value locally when dragged', () => {
    // before
    renderImagePanel();
    const track = screen.getByRole('slider', { name: 'Exposure' }) as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action — a quarter of the way across a [-100, 100] range lands on -50
    act(() => {
      track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));
    });

    // result
    expect(track).toHaveAttribute('aria-valuenow', '-50');
  });
});
