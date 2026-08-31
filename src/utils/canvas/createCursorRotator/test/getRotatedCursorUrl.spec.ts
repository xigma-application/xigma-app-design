// assets
import resizeCursorUrl from 'assets/icons/cursors/resize.png';
import rotateCursorUrl from 'assets/icons/cursors/rotate.png';
import scaleCursorUrl from 'assets/icons/cursors/scale.png';

// types
import type { TCursorKind } from '../types';

vi.mock('../createCursorRotator', () => ({
  createCursorRotator: vi.fn(
    (imageSrc: string) =>
      (angle: number): string =>
        `${imageSrc}:${angle}`,
  ),
}));

describe('getRotatedCursorUrl', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('should dispatch to the resize cursor asset', async () => {
    // before
    const { getRotatedCursorUrl } = await import('../getRotatedCursorUrl');

    // action
    const url = getRotatedCursorUrl('resize', 45);

    // result
    expect(url).toBe(`${resizeCursorUrl}:45`);
  });

  it('should dispatch to the rotate cursor asset', async () => {
    // before
    const { getRotatedCursorUrl } = await import('../getRotatedCursorUrl');

    // action
    const url = getRotatedCursorUrl('rotate', 90);

    // result
    expect(url).toBe(`${rotateCursorUrl}:90`);
  });

  it('should dispatch to the scale cursor asset', async () => {
    // before
    const { getRotatedCursorUrl } = await import('../getRotatedCursorUrl');

    // action
    const url = getRotatedCursorUrl('scale', 180);

    // result
    expect(url).toBe(`${scaleCursorUrl}:180`);
  });

  it('should return null for an unknown cursor kind', async () => {
    // before
    const { getRotatedCursorUrl } = await import('../getRotatedCursorUrl');

    // action
    const url = getRotatedCursorUrl('unknown' as unknown as TCursorKind, 0);

    // result
    expect(url).toBeNull();
  });
});
