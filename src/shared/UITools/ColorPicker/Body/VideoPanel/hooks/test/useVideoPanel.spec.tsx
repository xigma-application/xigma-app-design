import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { TUseVideoPanelResult, useVideoPanel } from '../useVideoPanel';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { store } from 'store';

const extractVideoFrameMock = vi.fn();

vi.mock('utils/canvas/extractVideoFrame', () => ({
  extractVideoFrame: (...args: unknown[]): unknown => extractVideoFrameMock(...args),
}));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderVideoPanel = (): RenderHookResult<TUseVideoPanelResult, unknown> => renderHook(() => useVideoPanel(), { wrapper });

const renderVideoPanelWithInitial = (
  initialVideoUrl?: string,
  initialFillMode?: TUseVideoPanelResult['fillMode'],
): RenderHookResult<TUseVideoPanelResult, unknown> => renderHook(() => useVideoPanel(initialVideoUrl, initialFillMode), { wrapper });

describe('useVideoPanel behaviors', () => {
  beforeEach(() => {
    extractVideoFrameMock.mockReset();
  });

  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should default to fill mode', () => {
    // before
    const { result } = renderVideoPanel();

    // result
    expect(result.current).toMatchObject({ fillMode: 'fill' });
  });

  it('should update fillMode when setFillMode is called', () => {
    // before
    const { result } = renderVideoPanel();

    // action
    act(() => result.current.setFillMode('tile'));

    // result
    expect(result.current.fillMode).toBe('tile');
  });

  it('should default videoUrl to null', () => {
    // before
    const { result } = renderVideoPanel();

    // result
    expect(result.current.videoUrl).toBeNull();
  });

  it('should set videoUrl to the extracted still frame of a supported video file, not the raw video itself', () => {
    // mock
    extractVideoFrameMock.mockImplementation((_file, onLoad) => onLoad({ naturalHeight: 180, naturalWidth: 320, src: 'blob:frame-url' }));

    // before
    const { result } = renderVideoPanel();
    const file = new File(['content'], 'clip.mp4', { type: 'video/mp4' });

    // action
    act(() => result.current.setVideo(file));

    // result
    expect(extractVideoFrameMock).toHaveBeenCalledWith(file, expect.any(Function));
    expect(result.current.videoUrl).toBe('blob:frame-url');
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });

  it('should revoke the previous frame URL when a new video replaces it', () => {
    // mock
    extractVideoFrameMock
      .mockImplementationOnce((_file, onLoad) => onLoad({ naturalHeight: 1, naturalWidth: 1, src: 'blob:first' }))
      .mockImplementationOnce((_file, onLoad) => onLoad({ naturalHeight: 1, naturalWidth: 1, src: 'blob:second' }));
    URL.revokeObjectURL = vi.fn();

    // before
    const { result } = renderVideoPanel();

    act(() => result.current.setVideo(new File(['content'], 'first.mp4', { type: 'video/mp4' })));

    // action
    act(() => result.current.setVideo(new File(['content'], 'second.mp4', { type: 'video/mp4' })));

    // result
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first');
    expect(result.current.videoUrl).toBe('blob:second');
  });

  it('should dispatch a design hint naming the extension of an unsupported file, without setting videoUrl or extracting a frame', () => {
    // before
    const { result } = renderVideoPanel();
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // action
    act(() => result.current.setVideo(file));

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe("This file type (.png) can't be used as video fill");
    expect(result.current.videoUrl).toBeNull();
    expect(extractVideoFrameMock).not.toHaveBeenCalled();
  });

  it('should keep setFillMode referentially stable across re-renders, so consumers can safely depend on it in a useEffect', () => {
    // before
    const { rerender, result } = renderVideoPanel();
    const firstSetFillMode = result.current.setFillMode;

    // action
    rerender();

    // result — an unstable reference here would re-fire any effect keyed on it every render
    expect(result.current.setFillMode).toBe(firstSetFillMode);
  });

  it('should seed videoUrl and fillMode from the existing paint on mount, so reselecting the same node shows its real state', () => {
    // before — mirrors what a node reselect (full remount) hands in from `paint.ref`/`paint.scaleMode`
    const { result } = renderVideoPanelWithInitial('video-1', 'fit');

    // result
    expect(result.current.videoUrl).toBe('video-1');
    expect(result.current.fillMode).toBe('fit');
  });

  it('should still default to null/fill when no initial values are given', () => {
    // before
    const { result } = renderVideoPanelWithInitial(undefined, undefined);

    // result
    expect(result.current.videoUrl).toBeNull();
    expect(result.current.fillMode).toBe('fill');
  });

  it('should not touch videoUrl when a later valid file follows an unsupported one', () => {
    // mock
    extractVideoFrameMock.mockImplementation((_file, onLoad) => onLoad({ naturalHeight: 1, naturalWidth: 1, src: 'blob:frame-url' }));

    // before
    const { result } = renderVideoPanel();

    act(() => result.current.setVideo(new File(['content'], 'photo.png', { type: 'image/png' })));
    expect(selectDesignHintLabelKey(store.getState())).not.toBeNull();

    // action
    act(() => result.current.setVideo(new File(['content'], 'clip.mp4', { type: 'video/mp4' })));

    // result
    expect(result.current.videoUrl).toBe('blob:frame-url');
  });
});
