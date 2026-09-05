// others
import { ZOOM_MAX, ZOOM_MIN } from '../../../../constants';

// utils
import { applyZoom } from '../applyZoom';
import { screenToWorld } from 'utils/transform/screenToWorld';

describe('applyZoom', () => {
  it('should increase zoom for a negative deltaY (scroll up / pinch out)', () => {
    // before
    const next = applyZoom({ x: 0, y: 0, zoom: 1 }, -100, { x: 50, y: 50 });

    // result
    expect(next.zoom).toBeGreaterThan(1);
  });

  it('should decrease zoom for a positive deltaY (scroll down / pinch in)', () => {
    // before
    const next = applyZoom({ x: 0, y: 0, zoom: 1 }, 100, { x: 50, y: 50 });

    // result
    expect(next.zoom).toBeLessThan(1);
  });

  it('should clamp zoom at ZOOM_MAX when already at the ceiling', () => {
    // before
    const next = applyZoom({ x: 0, y: 0, zoom: ZOOM_MAX }, -100, { x: 50, y: 50 });

    // result
    expect(next.zoom).toBe(ZOOM_MAX);
  });

  it('should clamp zoom at ZOOM_MIN when already at the floor', () => {
    // before
    const next = applyZoom({ x: 0, y: 0, zoom: ZOOM_MIN }, 100, { x: 50, y: 50 });

    // result
    expect(next.zoom).toBe(ZOOM_MIN);
  });

  it('should use a fixed, perceptible step for small trackpad-pinch deltaY values', () => {
    // before
    const next = applyZoom({ x: 0, y: 0, zoom: 1 }, -2, { x: 50, y: 50 });

    // result
    expect(next.zoom).toBeGreaterThan(1.01);
  });

  it('should keep the world point under the cursor fixed on screen', () => {
    // mock
    const cursor = { x: 120, y: 80 };
    const before = { x: 10, y: -5, zoom: 1.5 };

    // before
    const worldUnderCursorBefore = screenToWorld(cursor, before);
    const after = applyZoom(before, -50, cursor);
    const worldUnderCursorAfter = screenToWorld(cursor, after);

    // result
    expect(worldUnderCursorAfter.x).toBeCloseTo(worldUnderCursorBefore.x);
    expect(worldUnderCursorAfter.y).toBeCloseTo(worldUnderCursorBefore.y);
  });
});
