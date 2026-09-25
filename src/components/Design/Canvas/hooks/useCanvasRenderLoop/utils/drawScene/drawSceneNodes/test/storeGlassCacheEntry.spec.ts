// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { storeGlassCacheEntry } from '../storeGlassCacheEntry';

const copyMock = vi.fn();
const putMock = vi.fn();

vi.mock('../copyTargetRectToTexture', () => ({ copyTargetRectToTexture: (...args: unknown[]): unknown => copyMock(...args) }));
vi.mock('../putGlassCacheEntry', () => ({ putGlassCacheEntry: (...args: unknown[]): unknown => putMock(...args) }));
vi.mock('../getGlassValidWindow', () => ({ getGlassValidWindow: (): unknown => ({ localX: 1 }) }));

describe('storeGlassCacheEntry', () => {
  it('should copy the warped content and the shape mask and cache them with the raw size', () => {
    // mock
    const gl = createGlProxy();
    const warped = { id: 'warped' } as unknown as TRenderTarget;
    const mask = { id: 'mask' } as unknown as TRenderTarget;
    copyMock.mockImplementation((_gl: unknown, source: { id: string }) => ({
      framebuffer: `${source.id}-fb`,
      texture: `${source.id}-tex`,
    }));

    // before
    storeGlassCacheEntry(gl, 'n', 'state', warped, mask, { height: 4, rawHeight: 8, rawWidth: 6, width: 3, x: 0, y: 0 });
    storeGlassCacheEntry(gl, 'm', 'state', warped, mask, { height: 4, width: 3, x: 0, y: 0 });

    // result
    expect(putMock).toHaveBeenNthCalledWith(1, gl, 'n', {
      framebuffer: 'warped-fb',
      height: 4,
      localX: 1,
      maskFramebuffer: 'mask-fb',
      maskTexture: 'mask-tex',
      nodesState: 'state',
      rawHeight: 8,
      rawWidth: 6,
      texture: 'warped-tex',
      width: 3,
    });
    expect(putMock).toHaveBeenNthCalledWith(2, gl, 'm', expect.objectContaining({ rawHeight: 4, rawWidth: 3 }));
  });
});
