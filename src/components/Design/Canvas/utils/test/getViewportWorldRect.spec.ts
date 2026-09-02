// utils
import { getViewportWorldRect } from '../getViewportWorldRect';

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  Object.defineProperty(canvas, 'clientWidth', { value: width });
  Object.defineProperty(canvas, 'clientHeight', { value: height });

  return canvas;
};

describe('getViewportWorldRect', () => {
  it('should return the canvas size as the world rect at identity viewport', () => {
    // result
    expect(getViewportWorldRect(createCanvas(800, 600), { x: 0, y: 0, zoom: 1 })).toEqual({ height: 600, width: 800, x: 0, y: 0 });
  });

  it('should account for pan', () => {
    // result
    expect(getViewportWorldRect(createCanvas(800, 600), { x: 100, y: 50, zoom: 1 })).toEqual({ height: 600, width: 800, x: -100, y: -50 });
  });

  it('should account for zoom', () => {
    // result
    expect(getViewportWorldRect(createCanvas(800, 600), { x: 0, y: 0, zoom: 2 })).toEqual({ height: 300, width: 400, x: 0, y: 0 });
  });
});
