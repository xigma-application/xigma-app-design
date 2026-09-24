// utils
import { getRectBatchResources } from '../getRectBatchResources';

const createGl = (compiles: boolean, hasBuffer = true): WebGL2RenderingContext =>
  ({
    attachShader: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? {} : null)),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => (compiles ? {} : null)),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('getRectBatchResources', () => {
  it('should create the program and buffer once per context', () => {
    // mock
    const gl = createGl(true);

    // before
    const first = getRectBatchResources(gl);
    const second = getRectBatchResources(gl);

    // result
    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(gl.createProgram).toHaveBeenCalledTimes(1);
  });

  it('should return null when the program does not compile', () => {
    // before
    const resources = getRectBatchResources(createGl(false));

    // result
    expect(resources).toBeNull();
  });

  it('should return null when no buffer can be created', () => {
    // before
    const resources = getRectBatchResources(createGl(true, false));

    // result
    expect(resources).toBeNull();
  });
});
