// utils
import { isAutoLayoutPaddingHandleHit } from '../isAutoLayoutPaddingHandleHit';

const frame = { height: 200, width: 300, x: 0, y: 0 };

describe('isAutoLayoutPaddingHandleHit', () => {
  it('should reject a point outside the perpendicular tolerance, regardless of the padding value', () => {
    // mock
    const handle = { band: { height: 200, width: 0, x: 0, y: 0 }, handleCenter: { x: -1, y: 100 }, side: 'left' as const, value: 0 };

    // result
    expect(isAutoLayoutPaddingHandleHit('left', { x: 0, y: 150 }, frame, handle, 6, 30)).toBe(false);
  });

  it('should hit a zero-padding handle anywhere along the reach, from just outside the edge to the reach distance in', () => {
    // mock
    const handle = { band: { height: 200, width: 0, x: 0, y: 0 }, handleCenter: { x: -1, y: 100 }, side: 'left' as const, value: 0 };

    // result
    expect(isAutoLayoutPaddingHandleHit('left', { x: -1, y: 100 }, frame, handle, 6, 30)).toBe(true);
    expect(isAutoLayoutPaddingHandleHit('left', { x: 0, y: 100 }, frame, handle, 6, 30)).toBe(true);
    expect(isAutoLayoutPaddingHandleHit('left', { x: 30, y: 100 }, frame, handle, 6, 30)).toBe(true);
  });

  it('should miss a zero-padding handle past the reach distance', () => {
    // mock
    const handle = { band: { height: 200, width: 0, x: 0, y: 0 }, handleCenter: { x: -1, y: 100 }, side: 'left' as const, value: 0 };

    // result
    expect(isAutoLayoutPaddingHandleHit('left', { x: 31, y: 100 }, frame, handle, 6, 30)).toBe(false);
  });

  it('should miss a zero-padding handle further outside the frame than the tolerance allows', () => {
    // mock
    const handle = { band: { height: 200, width: 0, x: 0, y: 0 }, handleCenter: { x: -1, y: 100 }, side: 'left' as const, value: 0 };

    // result
    expect(isAutoLayoutPaddingHandleHit('left', { x: -10, y: 100 }, frame, handle, 6, 30)).toBe(false);
  });

  it('should hit an already-padded handle only within a plain circular tolerance of its own centre', () => {
    // mock — value > 0, so the wide reach logic does not apply
    const handle = { band: { height: 200, width: 40, x: 0, y: 0 }, handleCenter: { x: 20, y: 100 }, side: 'left' as const, value: 40 };

    // result
    expect(isAutoLayoutPaddingHandleHit('left', { x: 20, y: 100 }, frame, handle, 6, 30)).toBe(true);
    expect(isAutoLayoutPaddingHandleHit('left', { x: 40, y: 100 }, frame, handle, 6, 30)).toBe(false);
  });
});
