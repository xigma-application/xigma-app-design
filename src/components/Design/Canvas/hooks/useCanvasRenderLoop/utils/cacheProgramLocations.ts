const patchedContexts = new WeakSet<WebGL2RenderingContext>();

export const cacheProgramLocations = (gl: WebGL2RenderingContext): void => {
  if (!patchedContexts.has(gl)) {
    const uniformCache = new WeakMap<WebGLProgram, Map<string, WebGLUniformLocation | null>>();
    const attribCache = new WeakMap<WebGLProgram, Map<string, number>>();
    const getUniformLocation = gl.getUniformLocation.bind(gl);
    const getAttribLocation = gl.getAttribLocation.bind(gl);

    gl.getUniformLocation = (program: WebGLProgram, name: string): WebGLUniformLocation | null => {
      const locations = uniformCache.get(program) ?? new Map<string, WebGLUniformLocation | null>();

      uniformCache.set(program, locations);

      if (!locations.has(name)) {
        locations.set(name, getUniformLocation(program, name));
      }

      return locations.get(name) ?? null;
    };

    gl.getAttribLocation = (program: WebGLProgram, name: string): number => {
      const locations = attribCache.get(program) ?? new Map<string, number>();

      attribCache.set(program, locations);

      if (!locations.has(name)) {
        locations.set(name, getAttribLocation(program, name));
      }

      return locations.get(name) as number;
    };

    patchedContexts.add(gl);
  }
};
