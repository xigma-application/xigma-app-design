// others
import { ZOOM_MAX } from '../../constants';

// utils
import { getFitViewport } from '../getFitViewport';

describe('getFitViewport', () => {
  it('should center the bounds and scale to fill the narrower axis', () => {
    // before
    const bounds = { height: 100, width: 200, x: 0, y: 0 };
    const visibleRect = { height: 100, width: 400, x: 0, y: 0 };

    // result — width would need zoom 2, height needs zoom 1, so the smaller wins
    const viewport = getFitViewport(bounds, visibleRect, 0);

    expect(viewport.zoom).toBe(1);
    expect(viewport.x).toBe(100);
    expect(viewport.y).toBe(0);
  });

  it('should shrink the available area by the padding on both sides', () => {
    // before
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const visibleRect = { height: 120, width: 120, x: 0, y: 0 };

    // result — available area is 100x100 once 10px padding is removed from each side
    expect(getFitViewport(bounds, visibleRect, 10).zoom).toBe(1);
  });

  it('should clamp a zero-size selection to ZOOM_MAX instead of producing Infinity', () => {
    // before
    const bounds = { height: 0, width: 0, x: 10, y: 10 };
    const visibleRect = { height: 100, width: 100, x: 0, y: 0 };

    // result
    expect(getFitViewport(bounds, visibleRect, 0).zoom).toBe(ZOOM_MAX);
  });
});
