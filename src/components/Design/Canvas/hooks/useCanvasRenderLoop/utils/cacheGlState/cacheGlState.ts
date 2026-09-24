// utils
import { createTrackedGlState } from './createTrackedGlState';
import { serveTrackedParameters } from './serveTrackedParameters';
import { trackBlendFunc } from './trackBlendFunc';
import { trackFramebuffer } from './trackFramebuffer';
import { trackViewport } from './trackViewport';

const patchedContexts = new WeakSet<WebGL2RenderingContext>();

export const cacheGlState = (gl: WebGL2RenderingContext): void => {
  if (!patchedContexts.has(gl)) {
    const getParameter = gl.getParameter.bind(gl);
    const state = createTrackedGlState(gl, getParameter);

    trackFramebuffer(gl, state);
    trackViewport(gl, state);
    trackBlendFunc(gl, state);
    serveTrackedParameters(gl, state, getParameter);

    patchedContexts.add(gl);
  }
};
