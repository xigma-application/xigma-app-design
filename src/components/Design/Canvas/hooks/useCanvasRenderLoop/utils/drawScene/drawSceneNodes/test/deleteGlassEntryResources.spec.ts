// types
import { TGlassCacheEntry } from '../types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { deleteGlassEntryResources } from '../deleteGlassEntryResources';

describe('deleteGlassEntryResources', () => {
  it('should delete the content and mask framebuffers and textures', () => {
    // mock
    const gl = createGlProxy();

    // before
    deleteGlassEntryResources(gl, {
      framebuffer: 'fb',
      maskFramebuffer: 'mfb',
      maskTexture: 'mtex',
      texture: 'tex',
    } as unknown as TGlassCacheEntry);

    // result
    expect(vi.mocked(gl.deleteFramebuffer).mock.calls).toEqual([['fb'], ['mfb']]);
    expect(vi.mocked(gl.deleteTexture).mock.calls).toEqual([['tex'], ['mtex']]);
  });
});
