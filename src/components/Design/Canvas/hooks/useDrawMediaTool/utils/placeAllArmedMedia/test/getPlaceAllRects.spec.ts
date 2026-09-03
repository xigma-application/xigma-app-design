// utils
import { getPlaceAllRects } from '../getPlaceAllRects';

describe('getPlaceAllRects', () => {
  it('should center the largest (only) media on the given point', () => {
    // action
    const placed = getPlaceAllRects([{ naturalHeight: 50, naturalWidth: 100, src: 'a' }], { x: 0, y: 0 });

    // result
    expect(placed).toEqual([
      { media: { naturalHeight: 50, naturalWidth: 100, src: 'a' }, rect: { height: 50, width: 100, x: -50, y: -25 } },
    ]);
  });

  it('should rank by pixel area rather than list order, and butt each remaining rect exactly against the previous one', () => {
    // mock
    const small = { naturalHeight: 10, naturalWidth: 10, src: 'small' };
    const largest = { naturalHeight: 100, naturalWidth: 100, src: 'largest' };
    const medium = { naturalHeight: 40, naturalWidth: 40, src: 'medium' };

    // action
    const placed = getPlaceAllRects([small, largest, medium], { x: 0, y: 0 });

    // result
    expect(placed.map(({ media }) => media.src)).toEqual(['largest', 'medium', 'small']);
    expect(placed[0].rect).toEqual({ height: 100, width: 100, x: -50, y: -50 });
    // medium's bottom-right corner (-50, -50) lands exactly on largest's top-left corner — no gap
    expect(placed[1].rect).toEqual({ height: 40, width: 40, x: -90, y: -90 });
    // small's bottom-right corner (-90, -90) lands exactly on medium's top-left corner — no gap
    expect(placed[2].rect).toEqual({ height: 10, width: 10, x: -100, y: -100 });
  });

  it('should return an empty array for an empty list', () => {
    // action
    const placed = getPlaceAllRects([], { x: 0, y: 0 });

    // result
    expect(placed).toEqual([]);
  });
});
