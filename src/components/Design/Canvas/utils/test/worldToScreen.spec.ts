// utils
import { worldToScreen } from '../worldToScreen';

describe('worldToScreen', () => {
  it('should return the same point when the viewport is identity', () => {
    // before
    const screen = worldToScreen({ x: 50, y: 30 }, { x: 0, y: 0, zoom: 1 });

    // result
    expect(screen).toEqual({ x: 50, y: 30 });
  });

  it('should apply a pan offset', () => {
    // before
    const screen = worldToScreen({ x: 40, y: 10 }, { x: 10, y: 20, zoom: 1 });

    // result
    expect(screen).toEqual({ x: 50, y: 30 });
  });

  it('should apply a zoom scale', () => {
    // before
    const screen = worldToScreen({ x: 50, y: 20 }, { x: 0, y: 0, zoom: 2 });

    // result
    expect(screen).toEqual({ x: 100, y: 40 });
  });

  it('should apply both pan and zoom together', () => {
    // before
    const screen = worldToScreen({ x: 50, y: 20 }, { x: 10, y: 20, zoom: 2 });

    // result
    expect(screen).toEqual({ x: 110, y: 60 });
  });
});
