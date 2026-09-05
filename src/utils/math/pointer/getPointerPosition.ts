// types
import { TPoint } from 'types/canvas';

export const getPointerPosition = (canvas: HTMLCanvasElement, event: MouseEvent): TPoint => {
  const rect = canvas.getBoundingClientRect();

  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};
