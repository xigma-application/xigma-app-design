// others
import { ZOOM_MAX, ZOOM_MIN } from '../../constants';

// utils
import { getZoomToViewport } from '../getZoomToViewport';

describe('getZoomToViewport', () => {
  it('should set the target zoom and keep the anchor point fixed on screen', () => {
    // before
    const viewport = getZoomToViewport({ x: 0, y: 0, zoom: 1 }, 2, { x: 50, y: 50 });

    // result
    expect(viewport).toEqual({ x: -50, y: -50, zoom: 2 });
  });

  it('should clamp the target zoom to ZOOM_MAX', () => {
    // result
    expect(getZoomToViewport({ x: 0, y: 0, zoom: 1 }, ZOOM_MAX + 1000, { x: 0, y: 0 }).zoom).toBe(ZOOM_MAX);
  });

  it('should clamp the target zoom to ZOOM_MIN', () => {
    // result
    expect(getZoomToViewport({ x: 0, y: 0, zoom: 1 }, ZOOM_MIN / 1000, { x: 0, y: 0 }).zoom).toBe(ZOOM_MIN);
  });
});
