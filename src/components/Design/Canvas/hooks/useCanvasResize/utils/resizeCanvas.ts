// others
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../../constants';

export const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const nextWidth = Math.round(width * dpr);
  const nextHeight = Math.round(height * dpr);

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const gl = canvas.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);

    gl?.viewport(0, 0, canvas.width, canvas.height);
  }
};
