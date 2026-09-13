// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TImageRenderContext } from '../../../types';

// utils
import { compositeBlend } from '../compositeBlend';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    BLEND: 3042,
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
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
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
    blendCompositeBuffer: { tag: 'blend-buffer' } as unknown as WebGLBuffer,
    blendCompositeProgram: { tag: 'blend-program' } as unknown as WebGLProgram,
  } as TImageRenderContext,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('compositeBlend', () => {
  it('should bind the content texture to unit 0, the backdrop to unit 1, set the blend mode uniform and draw the full-screen quad', () => {
    // mock
    const gl = createGlMock();
    const content = { tag: 'content' } as unknown as WebGLTexture;
    const backdrop = { tag: 'backdrop' } as unknown as WebGLTexture;

    // action
    compositeBlend(buildContext(gl), content, backdrop, BlendMode.multiply);

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(expect.objectContaining({ tag: 'blend-program' }));
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, content);
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE1);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, backdrop);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_content' }, 0);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_backdrop' }, 1);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_blendMode' }, 10);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should disable blending around the draw call and restore it afterwards', () => {
    // mock
    const gl = createGlMock();
    const calls: string[] = [];

    (gl.disable as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => calls.push('disable'));
    (gl.drawArrays as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => calls.push('draw'));
    (gl.enable as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => calls.push('enable'));

    // action
    compositeBlend(buildContext(gl), {} as WebGLTexture, {} as WebGLTexture, BlendMode.screen);

    // result
    expect(gl.disable).toHaveBeenCalledWith(gl.BLEND);
    expect(gl.enable).toHaveBeenCalledWith(gl.BLEND);
    expect(calls).toEqual(['disable', 'draw', 'enable']);
  });

  it('should re-upload the full-screen quad geometry every call', () => {
    // mock
    const gl = createGlMock();

    // action
    compositeBlend(buildContext(gl), {} as WebGLTexture, {} as WebGLTexture, BlendMode.normal);

    // result
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, expect.any(Float32Array), gl.STATIC_DRAW);
    const [, quad] = (gl.bufferData as unknown as { mock: { calls: unknown[][] } }).mock.calls[0] as [number, Float32Array];
    expect(Array.from(quad)).toHaveLength(12);
  });
});
