// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';

// utils
import { drawEffectTextureIsolated } from '../drawEffectTextureIsolated';

const drawEffectTextureMock = vi.fn();
const compositeBlendMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('../drawEffectTexture', () => ({
  drawEffectTexture: (...args: unknown[]): void => drawEffectTextureMock(...args),
}));
vi.mock('../../compositeBlend', () => ({ compositeBlend: (...args: unknown[]): void => compositeBlendMock(...args) }));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    BLEND_DST_ALPHA: 32970,
    BLEND_DST_RGB: 32968,
    BLEND_SRC_ALPHA: 32971,
    BLEND_SRC_RGB: 32969,
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,
    RGBA: 6408,
    SRC_ALPHA: 770,
    STENCIL_BUFFER_BIT: 1024,
    TEXTURE_2D: 3553,
    VIEWPORT: 2978,
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    copyTexImage2D: vi.fn(),
    drawingBufferHeight: 200,
    drawingBufferWidth: 300,
    getParameter: vi.fn((param: number) => {
      if (param === 36006) {
        return { tag: 'previous-framebuffer' };
      }

      if (param === 2978) {
        return new Int32Array([1, 2, 300, 200]);
      }

      return `blend-${param}`;
    }),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawEffectTextureIsolated', () => {
  it('should draw the texture into an isolated target and composite it over a copy of the backdrop with the blend mode', () => {
    // mock
    const gl = createGlMock();
    const backdrop = { framebuffer: {}, height: 200, texture: { tag: 'backdrop' }, width: 300 };
    const content = { framebuffer: { tag: 'content-fb' }, height: 200, texture: { tag: 'content' }, width: 300 };
    const acquire = vi.fn().mockReturnValueOnce(backdrop).mockReturnValueOnce(content);
    const release = vi.fn();
    const imageContext = {
      isAlphaWriteEnabled: false,
      renderTargetPool: { acquire, release },
    } as unknown as TImageRenderContext;
    const context = { gl, imageContext } as unknown as TDrawSceneContext;
    const texture = {} as WebGLTexture;
    const rect = { height: 10, width: 20, x: 1, y: 2 };

    // action
    drawEffectTextureIsolated(context, texture, rect, 15, 0.5, BlendMode.multiply);

    // result — backdrop captured before anything is drawn
    expect(gl.copyTexImage2D).toHaveBeenCalledWith(3553, 0, 6408, 0, 0, 300, 200, 0);

    // result — the texture is drawn into the content target with straight alpha
    expect(gl.bindFramebuffer).toHaveBeenNthCalledWith(1, gl.FRAMEBUFFER, content.framebuffer);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(1, gl, imageContext, true);
    expect(drawEffectTextureMock).toHaveBeenCalledWith(context, texture, rect, 15, 0.5);

    // result — state restored, then blended over the backdrop, then targets returned
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(1, 2, 300, 200);
    expect(gl.blendFuncSeparate).toHaveBeenLastCalledWith('blend-32969', 'blend-32968', 'blend-32971', 'blend-32970');
    expect(setAlphaWriteEnabledMock).toHaveBeenLastCalledWith(gl, imageContext, false);
    expect(compositeBlendMock).toHaveBeenCalledWith(context, content.texture, backdrop.texture, BlendMode.multiply);
    expect(release).toHaveBeenCalledWith(content);
    expect(release).toHaveBeenCalledWith(backdrop);
  });
});
