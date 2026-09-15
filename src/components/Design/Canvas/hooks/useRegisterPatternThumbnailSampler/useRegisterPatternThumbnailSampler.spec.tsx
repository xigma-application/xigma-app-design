import { renderHook } from '@testing-library/react';

// hooks
import { useRegisterPatternThumbnailSampler } from './useRegisterPatternThumbnailSampler';

// utils
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { samplePatternThumbnail } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

describe('useRegisterPatternThumbnailSampler', () => {
  it('should file a pending request with the given sourceNodeId and size', () => {
    // before
    const refs = createCanvasRefs();

    renderHook(() => useRegisterPatternThumbnailSampler(refs));

    // action
    void samplePatternThumbnail('node-a', 256);

    // result
    expect(refs.patternThumbnailRequestRef.current).toMatchObject({ size: 256, sourceNodeId: 'node-a' });
  });

  it('should resolve the sample once the render loop calls the filed onResolve callback', async () => {
    // before
    const refs = createCanvasRefs();

    renderHook(() => useRegisterPatternThumbnailSampler(refs));

    // action
    const samplePromise = samplePatternThumbnail('node-a', 256);

    refs.patternThumbnailRequestRef.current?.onResolve('data:image/png;base64,abc');

    // result
    expect(await samplePromise).toBe('data:image/png;base64,abc');
  });

  it('should stop answering sample requests once unmounted', async () => {
    // before
    const refs = createCanvasRefs();
    const { unmount } = renderHook(() => useRegisterPatternThumbnailSampler(refs));

    unmount();

    // action
    const result = await samplePatternThumbnail('node-a', 256);

    // result
    expect(result).toBeNull();
  });
});
