import { renderHook } from '@testing-library/react';

// hooks
import { useNotifyImagePanelState } from '../useNotifyImagePanelState';

// types
import { TUseImagePanelResult } from '../../Body/ImagePanel/hooks/useImagePanel';

const imagePanelFor = (overrides: Partial<TUseImagePanelResult> = {}): TUseImagePanelResult =>
  ({
    imageUrl: null,
    ...overrides,
  }) as TUseImagePanelResult;

describe('useNotifyImagePanelState', () => {
  it('should report the image url whenever it changes', () => {
    // mock
    const onImageUrlChange = vi.fn();

    // before
    renderHook(() => useNotifyImagePanelState(imagePanelFor({ imageUrl: 'blob:asset-1' }), onImageUrlChange));

    // result
    expect(onImageUrlChange).toHaveBeenCalledWith('blob:asset-1');
  });

  it('should report a fill-mode image paint change once a source is picked', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    renderHook(() => useNotifyImagePanelState(imagePanelFor({ imageUrl: 'blob:asset-1' }), undefined, onImageChange));

    // result
    expect(onImageChange).toHaveBeenCalledWith({ ref: 'blob:asset-1', scaleMode: 'fill' });
  });

  it('should not report an image paint change while no source has been picked yet', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    renderHook(() => useNotifyImagePanelState(imagePanelFor(), undefined, onImageChange));

    // result
    expect(onImageChange).not.toHaveBeenCalled();
  });

  it('should not throw when no callback is given', () => {
    // before / result
    expect(() => renderHook(() => useNotifyImagePanelState(imagePanelFor({ imageUrl: 'blob:asset-1' })))).not.toThrow();
  });

  it('should not re-invoke onImageChange for the same url when only the callback identity changes (regression: this fed an infinite dispatch loop, since committing the paint change gives the caller a new paint object on every render, which rebuilds onImageChange fresh every time)', () => {
    // mock
    const onImageChangeFirst = vi.fn();
    const onImageChangeSecond = vi.fn();
    const panel = imagePanelFor({ imageUrl: 'blob:asset-1' });

    // before
    const { rerender } = renderHook(({ onImageChange }) => useNotifyImagePanelState(panel, undefined, onImageChange), {
      initialProps: { onImageChange: onImageChangeFirst },
    });

    // action — a brand new callback reference, same underlying imageUrl
    rerender({ onImageChange: onImageChangeSecond });

    // result
    expect(onImageChangeFirst).toHaveBeenCalledTimes(1);
    expect(onImageChangeSecond).not.toHaveBeenCalled();
  });
});
