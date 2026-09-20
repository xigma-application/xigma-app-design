export const BLUR_ZOOM_SETTLE_MS = 200;

const zoomStates = new WeakMap<WebGL2RenderingContext, { changedAt: number; zoom: number }>();

export const isBlurZoomChanging = (gl: WebGL2RenderingContext, zoom: number, now: number): boolean => {
  const state = zoomStates.get(gl);

  if (state && state.zoom === zoom) {
    return now - state.changedAt < BLUR_ZOOM_SETTLE_MS;
  }

  zoomStates.set(gl, { changedAt: now, zoom });

  return true;
};
