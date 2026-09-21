// utils
import { registerExportRenderer, renderNodeForExport } from '../exportRenderRegistry';

describe('exportRenderRegistry', () => {
  it('should resolve null when no renderer is registered', async () => {
    // action
    const result = await renderNodeForExport('node-a', 2, true, 'detailed', 'srgb');

    // result
    expect(result).toBeNull();
  });

  it('should forward the render request to the registered renderer', async () => {
    // mock
    const pixels = { height: 20, pixels: new Uint8Array(4), width: 20 };
    const renderer = vi.fn().mockResolvedValue(pixels);

    // before
    const unregister = registerExportRenderer(renderer);

    // action
    const result = await renderNodeForExport('node-a', 2, true, 'detailed', 'srgb');

    // result
    expect(renderer).toHaveBeenCalledWith('node-a', 2, true, 'detailed', 'srgb');
    expect(result).toBe(pixels);

    // after
    unregister();
  });

  it('should stop forwarding once unregistered', async () => {
    // mock
    const renderer = vi.fn().mockResolvedValue(null);

    // before
    const unregister = registerExportRenderer(renderer);

    unregister();

    // action
    const result = await renderNodeForExport('node-a', 2, true, 'detailed', 'srgb');

    // result
    expect(renderer).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should not unregister a newer renderer when an older unregister fn is called after being replaced', async () => {
    // mock
    const firstRenderer = vi.fn().mockResolvedValue(null);
    const secondPixels = { height: 20, pixels: new Uint8Array(4), width: 20 };
    const secondRenderer = vi.fn().mockResolvedValue(secondPixels);

    // before
    const unregisterFirst = registerExportRenderer(firstRenderer);

    registerExportRenderer(secondRenderer);
    unregisterFirst();

    // action
    const result = await renderNodeForExport('node-a', 2, true, 'detailed', 'srgb');

    // result
    expect(result).toBe(secondPixels);
  });
});
