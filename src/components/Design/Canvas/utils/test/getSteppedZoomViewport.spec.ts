// others
import { ZOOM_MAX, ZOOM_MIN } from '../../constants';

// utils
import { getSteppedZoomViewport } from '../getSteppedZoomViewport';

describe('getSteppedZoomViewport', () => {
  it('should step in to the next preset above the current zoom', () => {
    // result
    expect(getSteppedZoomViewport({ x: 0, y: 0, zoom: 1 }, 'in', { x: 0, y: 0 }).zoom).toBe(1.5);
  });

  it('should step out to the next preset below the current zoom', () => {
    // result
    expect(getSteppedZoomViewport({ x: 0, y: 0, zoom: 1 }, 'out', { x: 0, y: 0 }).zoom).toBe(0.75);
  });

  it('should treat a zoom exactly on a preset as that preset when stepping in', () => {
    // result
    expect(getSteppedZoomViewport({ x: 0, y: 0, zoom: 0.75 }, 'in', { x: 0, y: 0 }).zoom).toBe(1);
  });

  it('should clamp to ZOOM_MAX when already past the last preset', () => {
    // result
    expect(getSteppedZoomViewport({ x: 0, y: 0, zoom: ZOOM_MAX }, 'in', { x: 0, y: 0 }).zoom).toBe(ZOOM_MAX);
  });

  it('should clamp to ZOOM_MIN when already below the first preset', () => {
    // result
    expect(getSteppedZoomViewport({ x: 0, y: 0, zoom: ZOOM_MIN }, 'out', { x: 0, y: 0 }).zoom).toBe(ZOOM_MIN);
  });

  it('should keep the anchor point fixed on screen while stepping', () => {
    // before
    const viewport = getSteppedZoomViewport({ x: 0, y: 0, zoom: 1 }, 'in', { x: 100, y: 0 });

    // result
    expect(viewport).toEqual({ x: -50, y: 0, zoom: 1.5 });
  });
});
