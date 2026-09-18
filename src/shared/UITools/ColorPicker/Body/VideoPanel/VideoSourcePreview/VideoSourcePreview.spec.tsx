import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode, useRef } from 'react';
import { Provider } from 'react-redux';

// components
import VideoSourcePreview from './VideoSourcePreview';

// hooks
import { useVideoPanel } from '../hooks/useVideoPanel';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { store } from 'store';

const extractVideoFrameMock = vi.fn();

vi.mock('utils/canvas/extractVideoFrame', () => ({
  extractVideoFrame: (...args: unknown[]): unknown => extractVideoFrameMock(...args),
}));

const VideoSourcePreviewWrapper = ({ initialVideoUrl }: { initialVideoUrl?: string }): ReactNode => {
  const videoPanel = useVideoPanel(initialVideoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  return <VideoSourcePreview videoPanel={videoPanel} videoRef={videoRef} />;
};

const renderVideoSourcePreview = (initialVideoUrl?: string): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <VideoSourcePreviewWrapper initialVideoUrl={initialVideoUrl} />
    </Provider>,
  );

describe('VideoSourcePreview snapshots', () => {
  it('should render VideoSourcePreview', () => {
    // before
    const { asFragment } = renderVideoSourcePreview();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VideoSourcePreview behaviors', () => {
  beforeEach(() => {
    extractVideoFrameMock.mockReset();
  });

  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should render the upload-from-computer button', () => {
    // before
    renderVideoSourcePreview();

    // result
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
  });

  it('should render a hidden video element with no overlay before a file is picked', () => {
    // before
    const { container } = renderVideoSourcePreview();

    // result
    expect(container.querySelector('video')).toHaveAttribute('hidden');
    expect(container.querySelector('[class*="VideoSourcePreview__overlay"]')).toBeNull();
  });

  it('should show a live, playable video element with the raw file and wrap the buttons in the hover overlay', () => {
    // mock
    extractVideoFrameMock.mockImplementation((_file, onLoad) => onLoad({ naturalHeight: 180, naturalWidth: 320, src: 'blob:frame-url' }));
    URL.createObjectURL = vi.fn(() => 'blob:raw-video-url');

    // before
    const { container } = renderVideoSourcePreview();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'clip.mp4', { type: 'video/mp4' });

    // action
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // result
    const overlay = container.querySelector('[class*="VideoSourcePreview__overlay"]');
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video).not.toHaveAttribute('hidden');
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('src', 'blob:raw-video-url');
    expect(video).toHaveAttribute('poster', 'blob:frame-url');
    expect(overlay).not.toBeNull();
    expect(overlay).toContainElement(screen.getByRole('button', { name: 'Upload from computer' }));
  });

  it('should still show the extracted-frame picture (as a poster, with no playable src) when reopened for an already-committed video paint, since the raw file is never persisted', () => {
    // before — mirrors reselecting a node after closing the picker: only `paint.ref` (the extracted
    // frame) survives, the raw file/blob from the original pick is gone
    const { container } = renderVideoSourcePreview('blob:persisted-frame-url');

    // result
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video).not.toHaveAttribute('hidden');
    expect(video).toHaveAttribute('poster', 'blob:persisted-frame-url');
    expect(video).not.toHaveAttribute('src');
    expect(container.querySelector('[class*="VideoSourcePreview__overlay"]')).not.toBeNull();
  });

  it('should dispatch a design hint naming the extension when an unsupported file is picked, without extracting a frame', () => {
    // before
    const { container } = renderVideoSourcePreview();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // action
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe("This file type (.png) can't be used as video fill");
    expect(container.querySelector('[class*="VideoSourcePreview__overlay"]')).toBeNull();
    expect(extractVideoFrameMock).not.toHaveBeenCalled();
  });
});
