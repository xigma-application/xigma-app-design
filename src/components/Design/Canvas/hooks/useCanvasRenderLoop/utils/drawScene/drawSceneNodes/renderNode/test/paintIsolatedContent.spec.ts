// types
import { TMaskRenderer } from '../../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { paintIsolatedContent } from '../paintIsolatedContent';

const calls: string[] = [];
const getBlurCacheEntryMock = vi.fn();
const getIsolatedSubtreeMock = vi.fn();
const isBlurCacheableMock = vi.fn();
const isBlurZoomChangingMock = vi.fn();
const storeBlurCacheEntryMock = vi.fn();
const blitBlurCacheEntryMock = vi.fn();

vi.mock('../../applyTextureEffect', () => ({ applyTextureEffect: (): number => calls.push('texture') }));
vi.mock('../../blitBlurCacheEntry', () => ({
  blitBlurCacheEntry: (...args: unknown[]): number => calls.push('blit') && blitBlurCacheEntryMock(...args),
}));
vi.mock('../../blurIsolatedNode', () => ({ blurIsolatedNode: (): number => calls.push('blur') }));
vi.mock('../dispatchNodeType', () => ({ dispatchNodeType: (): number => calls.push('paint') }));
vi.mock('../../getBlurCacheEntry', () => ({ getBlurCacheEntry: (...args: unknown[]): unknown => getBlurCacheEntryMock(...args) }));
vi.mock('../../getBlurCacheKey', () => ({ getBlurCacheKey: (): string => 'key' }));
vi.mock('../../getIsolatedSubtree', () => ({ getIsolatedSubtree: (...args: unknown[]): unknown => getIsolatedSubtreeMock(...args) }));
vi.mock('../../isBlurCacheable', () => ({ isBlurCacheable: (...args: unknown[]): unknown => isBlurCacheableMock(...args) }));
vi.mock('../../isBlurZoomChanging', () => ({ isBlurZoomChanging: (...args: unknown[]): unknown => isBlurZoomChangingMock(...args) }));
vi.mock('../../storeBlurCacheEntry', () => ({
  storeBlurCacheEntry: (...args: unknown[]): number => calls.push('store') && storeBlurCacheEntryMock(...args),
}));

const node = { id: 'n1', type: 'rectangle' } as unknown as TSceneNode;
const target = { tag: 'target' } as unknown as TRenderTarget;
const RECT = { height: 20, width: 30, x: 4, y: 6 };
const renderer = { context: { viewport: { zoom: 2 } }, gl: { tag: 'gl' } } as unknown as TMaskRenderer;

describe('paintIsolatedContent', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    getIsolatedSubtreeMock.mockReturnValue([]);
    isBlurCacheableMock.mockReturnValue(true);
    isBlurZoomChangingMock.mockReturnValue(false);
    getBlurCacheEntryMock.mockReturnValue(null);
  });

  it('should paint, blur, apply the texture and only then remember the finished content', () => {
    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['paint', 'blur', 'texture', 'store']);
    expect(storeBlurCacheEntryMock).toHaveBeenCalledWith(renderer.gl, 'n1', 'key', target, RECT, 2);
  });

  it('should reuse the remembered content, textured already, without painting or texturing again', () => {
    // mock
    getBlurCacheEntryMock.mockReturnValue({ clipped: false, zoom: 2 });

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['blit']);
  });

  it('should stretch an entry of another zoom while the zoom is still changing', () => {
    // mock
    getBlurCacheEntryMock.mockReturnValue({ clipped: false, zoom: 1 });
    isBlurZoomChangingMock.mockReturnValue(true);

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['blit']);
  });

  it('should repaint when an entry of another zoom is found and the zoom has settled', () => {
    // mock
    getBlurCacheEntryMock.mockReturnValue({ clipped: false, zoom: 1 });

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['paint', 'blur', 'texture', 'store']);
  });

  it('should reuse a clipped entry only for the same zoom and the same region', () => {
    // mock
    getBlurCacheEntryMock.mockReturnValue({ clipped: true, height: 20, width: 30, x: 4, y: 6, zoom: 2 });

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['blit']);

    // mock
    calls.length = 0;
    getBlurCacheEntryMock.mockReturnValue({ clipped: true, height: 20, width: 30, x: 99, y: 6, zoom: 2 });

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['paint', 'blur', 'texture', 'store']);
  });

  it('should not remember anything without a rect or when the content cannot be cached', () => {
    // action
    paintIsolatedContent(renderer, node, target, null);

    // result
    expect(calls).toEqual(['paint', 'blur', 'texture']);

    // mock
    calls.length = 0;
    isBlurCacheableMock.mockReturnValue(false);

    // action
    paintIsolatedContent(renderer, node, target, RECT);

    // result
    expect(calls).toEqual(['paint', 'blur', 'texture']);
  });
});
