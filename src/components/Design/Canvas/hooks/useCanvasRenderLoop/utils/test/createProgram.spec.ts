// utils
import { createProgram } from '../createProgram';

const createGlMock = (linked: boolean): WebGL2RenderingContext =>
  ({
    attachShader: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => ({})),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    getProgramParameter: vi.fn(() => linked),
    getShaderParameter: vi.fn(() => true),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('createProgram', () => {
  it('should return a linked program', () => {
    // mock
    const gl = createGlMock(true);

    // result
    expect(createProgram(gl, 'vertex', 'fragment')).not.toBeNull();
  });

  it('should delete and return null when linking fails', () => {
    // mock
    const gl = createGlMock(false);

    // result
    expect(createProgram(gl, 'vertex', 'fragment')).toBeNull();
    expect(gl.deleteProgram).toHaveBeenCalled();
  });

  it('should return null without attaching shaders when shader compilation fails', () => {
    // mock
    const gl = {
      ...createGlMock(true),
      getShaderParameter: vi.fn(() => false),
    } as unknown as WebGL2RenderingContext;

    // result
    expect(createProgram(gl, 'vertex', 'fragment')).toBeNull();
    expect(gl.attachShader).not.toHaveBeenCalled();
  });
});
