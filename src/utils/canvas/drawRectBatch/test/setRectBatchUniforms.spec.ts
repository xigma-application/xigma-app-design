// utils
import { setRectBatchUniforms } from '../setRectBatchUniforms';

describe('setRectBatchUniforms', () => {
  it('should activate the program and upload viewport, zoom and resolution', () => {
    // mock
    const program = {} as WebGLProgram;
    const gl = {
      getUniformLocation: vi.fn((_, name: string) => name),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      useProgram: vi.fn(),
    } as unknown as WebGL2RenderingContext;

    // before
    setRectBatchUniforms(gl, program, 800, 600, { x: 10, y: 20, zoom: 2 });

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.uniform2f).toHaveBeenCalledWith('u_viewportOffset', 10, 20);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_zoom', 2);
    expect(gl.uniform2f).toHaveBeenCalledWith('u_resolution', 800, 600);
  });
});
