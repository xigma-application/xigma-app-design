// others
import glassFragmentShaderSource from 'constant/webgl/glassFragmentShaderSource';
import maskCompositeVertexShaderSource from 'constant/webgl/maskCompositeVertexShaderSource';

// utils
import { createProgram } from '../../createProgram';

export type TGlassProgram = { buffer: WebGLBuffer; program: WebGLProgram };

const programs = new WeakMap<WebGL2RenderingContext, TGlassProgram | null>();

export const getGlassProgram = (gl: WebGL2RenderingContext): TGlassProgram | null => {
  if (!programs.has(gl)) {
    const program = createProgram(gl, maskCompositeVertexShaderSource, glassFragmentShaderSource);
    const buffer = gl.createBuffer();

    programs.set(gl, program && buffer ? { buffer, program } : null);
  }

  return programs.get(gl) ?? null;
};
