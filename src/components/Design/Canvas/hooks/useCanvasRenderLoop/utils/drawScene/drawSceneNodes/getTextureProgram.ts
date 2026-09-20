// others
import maskCompositeVertexShaderSource from 'constant/webgl/maskCompositeVertexShaderSource';
import textureFragmentShaderSource from 'constant/webgl/textureFragmentShaderSource';

// utils
import { createProgram } from '../../createProgram';

export type TTextureProgram = { buffer: WebGLBuffer; program: WebGLProgram };

const programs = new WeakMap<WebGL2RenderingContext, TTextureProgram | null>();

export const getTextureProgram = (gl: WebGL2RenderingContext): TTextureProgram | null => {
  if (!programs.has(gl)) {
    const program = createProgram(gl, maskCompositeVertexShaderSource, textureFragmentShaderSource);
    const buffer = gl.createBuffer();

    programs.set(gl, program && buffer ? { buffer, program } : null);
  }

  return programs.get(gl) ?? null;
};
