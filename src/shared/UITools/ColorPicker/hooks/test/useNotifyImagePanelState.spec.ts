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

  it('should report a fill-mode image paint change once a source is genuinely picked, transitioning from no image', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    const { rerender } = renderHook(({ imageUrl }) => useNotifyImagePanelState(imagePanelFor({ imageUrl }), undefined, onImageChange), {
      initialProps: { imageUrl: null as string | null },
    });

    // action
    rerender({ imageUrl: 'blob:asset-1' });

    // result
    expect(onImageChange).toHaveBeenCalledWith({ ref: 'blob:asset-1', scaleMode: 'fill' });
  });

  it('should report the current fill mode (Fit), not hardcode Fill, when a source is picked with Fit already selected', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    const { rerender } = renderHook(
      ({ imageUrl }) => useNotifyImagePanelState(imagePanelFor({ fillMode: 'fit', imageUrl }), undefined, onImageChange),
      { initialProps: { imageUrl: null as string | null } },
    );

    // action
    rerender({ imageUrl: 'blob:asset-1' });

    // result
    expect(onImageChange).toHaveBeenCalledWith({ ref: 'blob:asset-1', scaleMode: 'fit' });
  });

  it('should not report an image paint change while no source has been picked yet', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    renderHook(() => useNotifyImagePanelState(imagePanelFor(), undefined, onImageChange));

    // result
    expect(onImageChange).not.toHaveBeenCalled();
  });

  it('should not report an image paint change on mount when the panel already starts seeded with the paint’s existing image (regression: reselecting a node re-ran the "just picked a file" conversion and wiped the stored crop/rotation)', () => {
    // mock
    const onImageChange = vi.fn();

    // before
    renderHook(() => useNotifyImagePanelState(imagePanelFor({ imageUrl: 'blob:asset-1' }), undefined, onImageChange));

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

    // before
    const { rerender } = renderHook(
      ({ imageUrl, onImageChange }) => useNotifyImagePanelState(imagePanelFor({ imageUrl }), undefined, onImageChange),
      { initialProps: { imageUrl: null as string | null, onImageChange: onImageChangeFirst } },
    );

    // action — the url is picked for real, then a later render swaps only the callback identity
    rerender({ imageUrl: 'blob:asset-1', onImageChange: onImageChangeFirst });
    rerender({ imageUrl: 'blob:asset-1', onImageChange: onImageChangeSecond });

    // result
    expect(onImageChangeFirst).toHaveBeenCalledTimes(1);
    expect(onImageChangeSecond).not.toHaveBeenCalled();
  });
});
