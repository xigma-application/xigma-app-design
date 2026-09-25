// utils
import { cacheProgramLocations } from '../cacheProgramLocations';

const createGl = (): WebGL2RenderingContext =>
  ({
    getAttribLocation: vi.fn((_program: WebGLProgram, name: string) => name.length),
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => (name === 'u_missing' ? null : { name })),
  }) as unknown as WebGL2RenderingContext;

describe('cacheProgramLocations', () => {
  it('should look up each uniform and attribute once per program and reuse it', () => {
    // mock
    const gl = createGl();
    const { getAttribLocation, getUniformLocation } = gl;
    const program = {} as WebGLProgram;
    const otherProgram = {} as WebGLProgram;

    // before
    cacheProgramLocations(gl);

    // action
    const first = gl.getUniformLocation(program, 'u_color');
    const second = gl.getUniformLocation(program, 'u_color');
    gl.getUniformLocation(otherProgram, 'u_color');
    const attrib = gl.getAttribLocation(program, 'a_position');
    gl.getAttribLocation(program, 'a_position');

    // result
    expect(second).toBe(first);
    expect(getUniformLocation).toHaveBeenCalledTimes(2);
    expect(attrib).toBe(10);
    expect(getAttribLocation).toHaveBeenCalledTimes(1);
  });

  it('should cache a missing uniform as null', () => {
    // mock
    const gl = createGl();
    const { getUniformLocation } = gl;

    // before
    cacheProgramLocations(gl);

    // action
    gl.getUniformLocation({} as WebGLProgram, 'u_missing');
    const missing = gl.getUniformLocation({} as WebGLProgram, 'u_missing');

    // result
    expect(missing).toBeNull();
    expect(getUniformLocation).toHaveBeenCalledTimes(2);
  });

  it('should patch a context only once', () => {
    // mock
    const gl = createGl();

    // before
    cacheProgramLocations(gl);
    const patched = gl.getUniformLocation;
    cacheProgramLocations(gl);

    // result
    expect(gl.getUniformLocation).toBe(patched);
  });
});
