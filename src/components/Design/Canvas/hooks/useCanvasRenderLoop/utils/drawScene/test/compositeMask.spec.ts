// types
import { TDrawSceneContext } from '../types';
import { TImageRenderContext } from '../../../types';

// utils
import { compositeMask } from '../compositeMask';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE1: 33985,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 3),
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => ({ name })),
    uniform1i: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const buildContext = (gl: WebGL2RenderingContext): TDrawSceneContext => ({
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  imageContext: {
    maskCompositeBuffer: { tag: 'composite-buffer' } as unknown as WebGLBuffer,
    maskCompositeProgram: { tag: 'composite-program' } as unknown as WebGLProgram,
  } as TImageRenderContext,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('compositeMask', () => {
  it('should bind the content texture to unit 0, the mask to unit 1 and draw the full-screen quad', () => {
    // mock
    const gl = createGlMock();
    const content = { tag: 'content' } as unknown as WebGLTexture;
    const mask = { tag: 'mask' } as unknown as WebGLTexture;

    // action
    compositeMask(buildContext(gl), content, mask);

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(expect.objectContaining({ tag: 'composite-program' }));
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, content);
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE1);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, mask);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_content' }, 0);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_mask' }, 1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should re-upload the full-screen quad geometry every call', () => {
    // mock
    const gl = createGlMock();

    // action
    compositeMask(buildContext(gl), {} as WebGLTexture, {} as WebGLTexture);

    // result
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, expect.any(Float32Array), gl.STATIC_DRAW);
    const [, quad] = (gl.bufferData as unknown as { mock: { calls: unknown[][] } }).mock.calls[0] as [number, Float32Array];
    expect(Array.from(quad)).toHaveLength(12);
  });
});
