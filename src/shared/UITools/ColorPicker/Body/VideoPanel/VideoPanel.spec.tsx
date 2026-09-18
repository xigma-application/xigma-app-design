import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// components
import VideoPanel, { TVideoPanelProps } from './VideoPanel';
import { TooltipProvider } from 'shared';

// hooks
import { useVideoPanel } from './hooks/useVideoPanel';

// store
import { store } from 'store';

const VideoPanelWrapper = ({
  onRotate,
  onScaleModeChange,
}: Pick<TVideoPanelProps, 'onRotate' | 'onScaleModeChange'>): ReactNode => {
  const videoPanel = useVideoPanel();

  return <VideoPanel onRotate={onRotate} onScaleModeChange={onScaleModeChange} videoPanel={videoPanel} />;
};

const renderVideoPanel = (onRotate?: TFunc, onScaleModeChange?: TVideoPanelProps['onScaleModeChange']): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VideoPanelWrapper onRotate={onRotate} onScaleModeChange={onScaleModeChange} />
      </TooltipProvider>
    </Provider>,
  );

describe('VideoPanel snapshots', () => {
  it('should render VideoPanel', () => {
    // before
    const { asFragment } = renderVideoPanel();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VideoPanel behaviors', () => {
  it('should render the fill-mode dropdown and the source preview, with no adjustment sliders', () => {
    // before
    renderVideoPanel();

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('should switch the dropdown to the picked fill mode', () => {
    // before
    renderVideoPanel();

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Tile'));

    // result
    expect(screen.getByText('Tile')).toBeInTheDocument();
  });

  it('should commit a real render-affecting scale mode (Fit) through onScaleModeChange', () => {
    // mock
    const onScaleModeChange = vi.fn();

    // before
    renderVideoPanel(undefined, onScaleModeChange);

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Fit'));

    // result
    expect(onScaleModeChange).toHaveBeenCalledWith('fit');
  });

  it('should call onRotate when the rotate button is clicked', () => {
    // mock
    const onRotate = vi.fn();

    // before
    renderVideoPanel(onRotate);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rotate image' }));

    // result
    expect(onRotate).toHaveBeenCalled();
  });
});
