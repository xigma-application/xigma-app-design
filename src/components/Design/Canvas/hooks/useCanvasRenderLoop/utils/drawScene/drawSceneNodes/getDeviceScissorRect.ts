// types
import { TMaskRenderer, TScissorRect } from './types';
import { TPoint } from 'types/canvas';

export const getDeviceScissorRect = (renderer: TMaskRenderer, corners: TPoint[], margin: number): TScissorRect => {
  const { context, gl } = renderer;
  const { viewport } = context;
  const pixelRatio = context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1;
  const xs = corners.map((corner) => (corner.x * viewport.zoom + viewport.x) * pixelRatio);
  const ys = corners.map((corner) => (corner.y * viewport.zoom + viewport.y) * pixelRatio);
  const rawLeft = Math.floor(Math.min(...xs) - margin);
  const rawRight = Math.ceil(Math.max(...xs) + margin);
  const rawBottom = Math.floor(gl.drawingBufferHeight - Math.max(...ys) - margin);
  const rawTop = Math.ceil(gl.drawingBufferHeight - Math.min(...ys) + margin);
  const left = Math.max(0, rawLeft);
  const right = Math.min(gl.drawingBufferWidth, rawRight);
  const bottom = Math.max(0, rawBottom);
  const top = Math.min(gl.drawingBufferHeight, rawTop);

  if (right > left && top > bottom) {
    const clipped = left !== rawLeft || right !== rawRight || bottom !== rawBottom || top !== rawTop;

    return {
      clipped,
      height: top - bottom,
      ...(clipped ? { margin } : {}),
      originX: rawLeft,
      originY: rawBottom,
      rawHeight: rawTop - rawBottom,
      rawWidth: rawRight - rawLeft,
      width: right - left,
      x: left,
      y: bottom,
    };
  }

  return { height: 0, offscreen: true, width: 0, x: 0, y: 0 };
};
