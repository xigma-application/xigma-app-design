// others
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../../constants';

// utils
import { cacheProgramLocations } from './cacheProgramLocations';

export const getCachedGlContext = (canvas: HTMLCanvasElement | null): WebGL2RenderingContext | null | undefined => {
  const gl = canvas?.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);

  if (gl) {
    cacheProgramLocations(gl);
  }

  return gl;
};
