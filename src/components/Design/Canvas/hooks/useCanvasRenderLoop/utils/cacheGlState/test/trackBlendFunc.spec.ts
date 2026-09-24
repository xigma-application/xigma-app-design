// types
import { TTrackedGlState } from '../types';

// utils
import { trackBlendFunc } from '../trackBlendFunc';

const createGl = (): { blendFunc: ReturnType<typeof vi.fn>; blendFuncSeparate: ReturnType<typeof vi.fn>; gl: WebGL2RenderingContext } => {
  const blendFunc = vi.fn();
  const blendFuncSeparate = vi.fn();

  return { blendFunc, blendFuncSeparate, gl: { blendFunc, blendFuncSeparate } as unknown as WebGL2RenderingContext };
};

const createState = (): TTrackedGlState => ({ blend: [0, 0, 0, 0], framebuffer: null, viewport: [0, 0, 0, 0] });

describe('trackBlendFunc', () => {
  it('should record blendFunc for both the color and the alpha channel and forward it', () => {
    // mock
    const { blendFunc, gl } = createGl();
    const state = createState();

    trackBlendFunc(gl, state);

    // before
    gl.blendFunc(1, 771);

    // result
    expect(blendFunc).toHaveBeenCalledWith(1, 771);
    expect(state.blend).toEqual([1, 771, 1, 771]);
  });

  it('should record blendFuncSeparate per channel and forward it', () => {
    // mock
    const { blendFuncSeparate, gl } = createGl();
    const state = createState();

    trackBlendFunc(gl, state);

    // before
    gl.blendFuncSeparate(770, 771, 1, 771);

    // result
    expect(blendFuncSeparate).toHaveBeenCalledWith(770, 771, 1, 771);
    expect(state.blend).toEqual([770, 771, 1, 771]);
  });
});
