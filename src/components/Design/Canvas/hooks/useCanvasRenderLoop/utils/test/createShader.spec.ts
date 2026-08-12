// utils
import { createShader } from '../createShader';

describe('createShader', () => {
  it('should return the compiled shader', () => {
    // mock
    const shader = {};
    const gl = {
      COMPILE_STATUS: 35713,
      compileShader: vi.fn(),
      createShader: vi.fn(() => shader),
      getShaderParameter: vi.fn(() => true),
      shaderSource: vi.fn(),
    } as unknown as WebGL2RenderingContext;

    // result
    expect(createShader(gl, gl.VERTEX_SHADER, 'source')).toBe(shader);
  });

  it('should delete and return null when compilation fails', () => {
    // mock
    const shader = {};
    const deleteShader = vi.fn();
    const gl = {
      COMPILE_STATUS: 35713,
      compileShader: vi.fn(),
      createShader: vi.fn(() => shader),
      deleteShader,
      getShaderParameter: vi.fn(() => false),
      shaderSource: vi.fn(),
    } as unknown as WebGL2RenderingContext;

    // result
    expect(createShader(gl, gl.VERTEX_SHADER, 'source')).toBeNull();
    expect(deleteShader).toHaveBeenCalledWith(shader);
  });

  it('should return null when the context cannot create a shader', () => {
    // mock
    const gl = { createShader: vi.fn(() => null) } as unknown as WebGL2RenderingContext;

    // result
    expect(createShader(gl, gl.VERTEX_SHADER, 'source')).toBeNull();
  });
});
