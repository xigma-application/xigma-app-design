import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
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

const VideoSourcePreviewWrapper = (): ReactNode => {
  const videoPanel = useVideoPanel();

  return <VideoSourcePreview videoPanel={videoPanel} />;
};

const renderVideoSourcePreview = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <VideoSourcePreviewWrapper />
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

  it('should show no background image and no overlay before a file is picked', () => {
    // before
    const { container } = renderVideoSourcePreview();

    // result
    expect(container.querySelector('[class*="VideoSourcePreview"]')).toHaveStyle({ backgroundImage: 'none' });
    expect(container.querySelector('[class*="VideoSourcePreview__overlay"]')).toBeNull();
  });

  it("should show the video's extracted still frame as the background and wrap the buttons in the hover overlay", () => {
    // mock
    extractVideoFrameMock.mockImplementation((_file, onLoad) => onLoad({ naturalHeight: 180, naturalWidth: 320, src: 'blob:frame-url' }));

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
    const preview = container.querySelector('[class*="VideoSourcePreview"]') as HTMLElement;

    expect(preview.style.backgroundImage).toContain('url("blob:frame-url")');
    expect(overlay).not.toBeNull();
    expect(overlay).toContainElement(screen.getByRole('button', { name: 'Upload from computer' }));
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
