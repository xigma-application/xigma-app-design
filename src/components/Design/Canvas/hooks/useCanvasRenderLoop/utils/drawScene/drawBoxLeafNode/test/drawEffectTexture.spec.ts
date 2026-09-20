// types
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';

// utils
import { drawEffectTexture } from '../drawEffectTexture';
import { EFFECT_NEUTRAL_IMAGE_ADJUSTMENT_UNIFORMS } from '../constants';

const drawImageMock = vi.fn();

vi.mock('utils/canvas/drawImage', () => ({ drawImage: (...args: unknown[]): void => drawImageMock(...args) }));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => ({ name })),
    uniform1f: vi.fn(),
    useProgram: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawEffectTexture', () => {
  it('should zero every image-adjustment uniform before drawing the texture as a plain quad', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const context: TDrawSceneContext = {
      buffer: {} as WebGLBuffer,
      canvasHeight: 200,
      canvasWidth: 300,
      gl,
      imageContext: { buffer, program } as TImageRenderContext,
      program: {} as WebGLProgram,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const rect = { height: 10, width: 20, x: 1, y: 2 };

    // action
    drawEffectTexture(context, texture, rect, 45, 0.5);

    // result
    EFFECT_NEUTRAL_IMAGE_ADJUSTMENT_UNIFORMS.forEach((name) => {
      expect(gl.uniform1f).toHaveBeenCalledWith({ name }, 0);
    });
    expect(drawImageMock).toHaveBeenCalledWith(gl, program, buffer, texture, rect, 300, 200, context.viewport, false, true, 45, 0.5);
  });
});
