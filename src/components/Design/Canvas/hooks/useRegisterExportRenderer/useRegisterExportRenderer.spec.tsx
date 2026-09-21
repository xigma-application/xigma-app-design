import { renderHook } from '@testing-library/react';

// hooks
import { useRegisterExportRenderer } from './useRegisterExportRenderer';

// utils
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

describe('useRegisterExportRenderer', () => {
  it('should file a pending request with the given nodeId, scale, ignoreOverlappingLayers and imageFilterQuality', () => {
    // before
    const refs = createCanvasRefs();

    renderHook(() => useRegisterExportRenderer(refs));

    // action
    void renderNodeForExport('node-a', 2, false, 'detailed');

    // result
    expect(refs.exportRenderRequestRef.current).toMatchObject({
      ignoreOverlappingLayers: false,
      imageFilterQuality: 'detailed',
      nodeId: 'node-a',
      scale: 2,
    });
  });

  it('should resolve the render once the render loop calls the filed onResolve callback', async () => {
    // before
    const refs = createCanvasRefs();

    renderHook(() => useRegisterExportRenderer(refs));

    // action
    const renderPromise = renderNodeForExport('node-a', 2, true, 'basic');
    const pixels = { height: 20, pixels: new Uint8Array(4), width: 20 };

    refs.exportRenderRequestRef.current?.onResolve(pixels);

    // result
    expect(await renderPromise).toBe(pixels);
  });

  it('should stop answering render requests once unmounted', async () => {
    // before
    const refs = createCanvasRefs();
    const { unmount } = renderHook(() => useRegisterExportRenderer(refs));

    unmount();

    // action
    const result = await renderNodeForExport('node-a', 2, true, 'basic');

    // result
    expect(result).toBeNull();
  });
});
