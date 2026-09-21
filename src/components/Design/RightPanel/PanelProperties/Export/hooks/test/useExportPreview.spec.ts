import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { useExportPreview } from '../useExportPreview';

// others
import { EXPORT_PREVIEW_SIZE } from '../../constants';

// utils
import { registerPatternThumbnailSampler } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

describe('useExportPreview', () => {
  it('should return null without requesting a sample when there is no nodeId', () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { result } = renderHook(() => useExportPreview(undefined));

    // result
    expect(result.current).toBeNull();
    expect(sampler).not.toHaveBeenCalled();

    // after
    unregister();
  });

  it('should resolve the preview data URL for the given nodeId', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { result } = renderHook(() => useExportPreview('node-a'));

    // result
    await waitFor(() => expect(result.current).toBe('data:image/png;base64,abc'));
    expect(sampler).toHaveBeenCalledWith('node-a', EXPORT_PREVIEW_SIZE);

    // after
    unregister();
  });

  it('should re-request when nodeId changes', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValueOnce('data:image/png;base64,first').mockResolvedValueOnce('data:image/png;base64,second');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { rerender, result } = renderHook(({ nodeId }) => useExportPreview(nodeId), { initialProps: { nodeId: 'node-a' } });

    await waitFor(() => expect(result.current).toBe('data:image/png;base64,first'));

    // action
    rerender({ nodeId: 'node-b' });

    // result
    await waitFor(() => expect(result.current).toBe('data:image/png;base64,second'));

    // after
    unregister();
  });

  it('should reset back to null once nodeId is cleared', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);
    const { rerender, result } = renderHook(({ nodeId }) => useExportPreview(nodeId), {
      initialProps: { nodeId: 'node-a' as string | undefined },
    });

    await waitFor(() => expect(result.current).toBe('data:image/png;base64,abc'));

    // action
    rerender({ nodeId: undefined });

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
    const { unmount } = renderHook(() => useExportPreview('node-a'));

    unmount();
    resolveSample('data:image/png;base64,abc');

    // result — nothing to assert on an unmounted hook's state; this only proves the post-unmount
    // resolution doesn't throw an act() warning or crash from setting state on an unmounted component
    await Promise.resolve();

    // after
    unregister();
  });
});
