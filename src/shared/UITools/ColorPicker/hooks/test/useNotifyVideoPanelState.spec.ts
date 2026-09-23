import { renderHook } from '@testing-library/react';

// hooks
import { useNotifyVideoPanelState } from '../useNotifyVideoPanelState';

// types
import { TUseVideoPanelResult } from '../../Body/VideoPanel/hooks/useVideoPanel';

const videoPanelFor = (overrides: Partial<TUseVideoPanelResult> = {}): TUseVideoPanelResult =>
  ({
    videoUrl: null,
    ...overrides,
  }) as TUseVideoPanelResult;

describe('useNotifyVideoPanelState', () => {
  it('should report the video url whenever it changes', () => {
    // mock
    const onVideoUrlChange = vi.fn();

    // before
    renderHook(() => useNotifyVideoPanelState(videoPanelFor({ videoUrl: 'blob:asset-1' }), onVideoUrlChange));

    // result
    expect(onVideoUrlChange).toHaveBeenCalledWith('blob:asset-1');
  });

  it('should report a fill-mode video paint change once a source is genuinely picked, transitioning from no video', () => {
    // mock
    const onVideoChange = vi.fn();

    // before
    const { rerender } = renderHook(({ videoUrl }) => useNotifyVideoPanelState(videoPanelFor({ videoUrl }), undefined, onVideoChange), {
      initialProps: { videoUrl: null as string | null },
    });

    // action
    rerender({ videoUrl: 'blob:asset-1' });

    // result
    expect(onVideoChange).toHaveBeenCalledWith({ ref: 'blob:asset-1', scaleMode: 'fill' });
  });

  it('should report the current fill mode (Fit), not hardcode Fill, when a source is picked with Fit already selected', () => {
    // mock
    const onVideoChange = vi.fn();

    // before
    const { rerender } = renderHook(
      ({ videoUrl }) => useNotifyVideoPanelState(videoPanelFor({ fillMode: 'fit', videoUrl }), undefined, onVideoChange),
      { initialProps: { videoUrl: null as string | null } },
    );

    // action
    rerender({ videoUrl: 'blob:asset-1' });

    // result
    expect(onVideoChange).toHaveBeenCalledWith({ ref: 'blob:asset-1', scaleMode: 'fit' });
  });

  it('should not report a video paint change while no source has been picked yet', () => {
    // mock
    const onVideoChange = vi.fn();

    // before
    renderHook(() => useNotifyVideoPanelState(videoPanelFor(), undefined, onVideoChange));

    // result
    expect(onVideoChange).not.toHaveBeenCalled();
  });

  it('should not report a video paint change on mount when the panel already starts seeded with the paint’s existing video', () => {
    // mock
    const onVideoChange = vi.fn();

    // before
    renderHook(() => useNotifyVideoPanelState(videoPanelFor({ videoUrl: 'blob:asset-1' }), undefined, onVideoChange));

    // result
    expect(onVideoChange).not.toHaveBeenCalled();
  });

  it('should not throw when no callback is given', () => {
    // before / result
    expect(() => renderHook(() => useNotifyVideoPanelState(videoPanelFor({ videoUrl: 'blob:asset-1' })))).not.toThrow();
  });

  it('should not re-invoke onVideoChange for the same url when only the callback identity changes', () => {
    // mock
    const onVideoChangeFirst = vi.fn();
    const onVideoChangeSecond = vi.fn();

    // before
    const { rerender } = renderHook(
      ({ videoUrl, onVideoChange }) => useNotifyVideoPanelState(videoPanelFor({ videoUrl }), undefined, onVideoChange),
      { initialProps: { onVideoChange: onVideoChangeFirst, videoUrl: null as string | null } },
    );

    // action — the url is picked for real, then a later render swaps only the callback identity
    rerender({ onVideoChange: onVideoChangeFirst, videoUrl: 'blob:asset-1' });
    rerender({ onVideoChange: onVideoChangeSecond, videoUrl: 'blob:asset-1' });

    // result
    expect(onVideoChangeFirst).toHaveBeenCalledTimes(1);
    expect(onVideoChangeSecond).not.toHaveBeenCalled();
  });
});
