import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { usePatternThumbnail } from '../usePatternThumbnail';

// utils
import { registerPatternThumbnailSampler } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

describe('usePatternThumbnail', () => {
  it('should return null without requesting a sample when there is no sourceNodeId', () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { result } = renderHook(() => usePatternThumbnail(null));

    // result
    expect(result.current).toBeNull();
    expect(sampler).not.toHaveBeenCalled();

    // after
    unregister();
  });

  it('should resolve the thumbnail data URL for the given sourceNodeId', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { result } = renderHook(() => usePatternThumbnail('node-a'));

    // result
    await waitFor(() => expect(result.current).toBe('data:image/png;base64,abc'));
    expect(sampler).toHaveBeenCalledWith('node-a', 256);

    // after
    unregister();
  });

  it('should re-request when sourceNodeId changes', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValueOnce('data:image/png;base64,first').mockResolvedValueOnce('data:image/png;base64,second');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { rerender, result } = renderHook(({ sourceNodeId }) => usePatternThumbnail(sourceNodeId), {
      initialProps: { sourceNodeId: 'node-a' },
    });

    await waitFor(() => expect(result.current).toBe('data:image/png;base64,first'));

    // action
    rerender({ sourceNodeId: 'node-b' });

    // result
    await waitFor(() => expect(result.current).toBe('data:image/png;base64,second'));
    expect(sampler).toHaveBeenLastCalledWith('node-b', 256);

    // after
    unregister();
  });

  it('should reset back to null when sourceNodeId is cleared', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { rerender, result } = renderHook(({ sourceNodeId }) => usePatternThumbnail(sourceNodeId), {
      initialProps: { sourceNodeId: 'node-a' as string | null },
    });

    await waitFor(() => expect(result.current).toBe('data:image/png;base64,abc'));

    // action
    rerender({ sourceNodeId: null });

    // result
    expect(result.current).toBeNull();

    // after
    unregister();
  });

  it('should ignore a stale resolution after unmounting mid-request', async () => {
    // mock
    let resolveSample: (value: string | null) => void = () => undefined;
    const sampler = vi.fn().mockImplementation(
      () =>
        new Promise<string | null>((resolve) => {
          resolveSample = resolve;
        }),
    );

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { unmount } = renderHook(() => usePatternThumbnail('node-a'));

    unmount();
    resolveSample('data:image/png;base64,abc');

    // result — nothing to assert on an unmounted hook's state; this only proves the post-unmount
    // resolution doesn't throw an act() warning or crash from setting state on an unmounted component
    await Promise.resolve();

    // after
    unregister();
  });
});
