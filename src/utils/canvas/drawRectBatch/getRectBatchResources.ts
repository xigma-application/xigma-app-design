// others
import rectBatchFragmentShaderSource from 'constant/webgl/rectBatchFragmentShaderSource';
import rectBatchVertexShaderSource from 'constant/webgl/rectBatchVertexShaderSource';

// types
import { TRectBatchResources } from './types';

// utils
import { createProgram } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/createProgram';

const resourcesByContext = new WeakMap<WebGL2RenderingContext, TRectBatchResources | null>();

export const getRectBatchResources = (gl: WebGL2RenderingContext): TRectBatchResources | null => {
  if (!resourcesByContext.has(gl)) {
    const program = createProgram(gl, rectBatchVertexShaderSource, rectBatchFragmentShaderSource);
    const buffer = gl.createBuffer();

    resourcesByContext.set(gl, program && buffer ? { buffer, program } : null);
  }

  return resourcesByContext.get(gl) ?? null;
};
