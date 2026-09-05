// utils
import { screenToWorld } from '../screenToWorld';

describe('screenToWorld', () => {
  it('should return the same point when the viewport is identity', () => {
    // before
    const world = screenToWorld({ x: 50, y: 30 }, { x: 0, y: 0, zoom: 1 });

    // result
    expect(world).toEqual({ x: 50, y: 30 });
  });

  it('should undo a pan offset', () => {
    // before
    const world = screenToWorld({ x: 50, y: 30 }, { x: 10, y: 20, zoom: 1 });

    // result
    expect(world).toEqual({ x: 40, y: 10 });
  });

  it('should undo a zoom scale', () => {
    // before
    const world = screenToWorld({ x: 100, y: 40 }, { x: 0, y: 0, zoom: 2 });

    // result
    expect(world).toEqual({ x: 50, y: 20 });
  });

  it('should undo both pan and zoom together', () => {
    // before
    const world = screenToWorld({ x: 110, y: 60 }, { x: 10, y: 20, zoom: 2 });

    // result
    expect(world).toEqual({ x: 50, y: 20 });
  });
});
