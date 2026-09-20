// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBlurCacheKey } from '../getBlurCacheKey';

const renderer = {
  context: { canvasWidth: 500, viewport: { x: 0, y: 0, zoom: 1 } },
  gl: { drawingBufferHeight: 600, drawingBufferWidth: 1000 },
} as unknown as TMaskRenderer;
const node = { id: 'r1', type: NodeType.rectangle, width: 10, x: 1, y: 2 } as unknown as TRectangleNode;

describe('getBlurCacheKey', () => {
  it('should ignore the node position so panning and moving reuse the cache', () => {
    // result
    expect(getBlurCacheKey(renderer, node)).toBe(getBlurCacheKey(renderer, { ...node, x: 300, y: 400 }));
  });

  it('should change with the node content but not with the zoom, which is handled by scaling the cached texture', () => {
    // mock
    const zoomed = { ...renderer, context: { ...renderer.context, viewport: { x: 0, y: 0, zoom: 2 } } } as unknown as TMaskRenderer;

    // result
    expect(getBlurCacheKey(renderer, node)).not.toBe(getBlurCacheKey(renderer, { ...node, width: 11 }));
    expect(getBlurCacheKey(renderer, node)).toBe(getBlurCacheKey(zoomed, node));
  });
});
