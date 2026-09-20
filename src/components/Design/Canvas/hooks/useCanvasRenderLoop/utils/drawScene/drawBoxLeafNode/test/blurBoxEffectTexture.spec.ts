// types
import { TImageRenderContext } from '../../../../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurBoxEffectTexture } from '../blurBoxEffectTexture';

const drawEffectBlurPassMock = vi.fn();

vi.mock('../drawEffectBlurPass', () => ({
  drawEffectBlurPass: (...args: unknown[]): void => drawEffectBlurPassMock(...args),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    bindFramebuffer: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const buildTarget = (tag: string, size: number): TRenderTarget => ({
  framebuffer: { tag: `${tag}-fb` } as unknown as WebGLFramebuffer,
  height: size,
  stencil: {} as WebGLRenderbuffer,
  texture: { tag: `${tag}-tex` } as unknown as WebGLTexture,
  width: size,
});

describe('blurBoxEffectTexture', () => {
  beforeEach(() => {
    drawEffectBlurPassMock.mockClear();
  });

  it('should blur horizontally into temp then vertically back into source', () => {
    // mock
    const gl = createGlMock();
    const source = buildTarget('source', 40);
    const temp = buildTarget('temp', 40);
    const imageContext = { blurBuffer: {} as WebGLBuffer, blurProgram: {} as WebGLProgram } as TImageRenderContext;

    // action
    blurBoxEffectTexture(gl, imageContext, source, temp, 8);

    // result
    expect(gl.bindFramebuffer).toHaveBeenNthCalledWith(1, gl.FRAMEBUFFER, temp.framebuffer);
    expect(drawEffectBlurPassMock).toHaveBeenNthCalledWith(
      1,
      gl,
      imageContext.blurProgram,
      imageContext.blurBuffer,
      source.texture,
      [1, 0],
      8,
      source.width,
      source.height,
    );
    expect(gl.bindFramebuffer).toHaveBeenNthCalledWith(2, gl.FRAMEBUFFER, source.framebuffer);
    expect(drawEffectBlurPassMock).toHaveBeenNthCalledWith(
      2,
      gl,
      imageContext.blurProgram,
      imageContext.blurBuffer,
      temp.texture,
      [0, 1],
      8,
      temp.width,
      temp.height,
    );
  });
});
