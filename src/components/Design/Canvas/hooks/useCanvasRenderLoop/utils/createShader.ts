export const createShader = (gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);

  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
  }

  return shader;
};
