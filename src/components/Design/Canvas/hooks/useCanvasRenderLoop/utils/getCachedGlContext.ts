// others
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../../constants';

// utils
import { cacheGlState } from './cacheGlState/cacheGlState';
import { cacheProgramLocations } from './cacheProgramLocations';

export const getCachedGlContext = (canvas: HTMLCanvasElement | null): WebGL2RenderingContext | null | undefined => {
  const gl = canvas?.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);

  if (gl) {
    cacheProgramLocations(gl);
    cacheGlState(gl);
  }

  return gl;
};
