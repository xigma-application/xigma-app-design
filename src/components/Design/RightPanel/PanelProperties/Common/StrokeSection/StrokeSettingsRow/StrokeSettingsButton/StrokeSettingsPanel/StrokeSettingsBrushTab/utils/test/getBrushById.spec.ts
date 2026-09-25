// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// utils
import { getBrushById } from '../getBrushById';

describe('getBrushById', () => {
  it('should find a brush in any category', () => {
    // mock
    const brush = BRUSH_CATEGORIES[BRUSH_CATEGORIES.length - 1].brushes[0];

    // result
    expect(getBrushById(brush.id)).toBe(brush);
  });

  it('should return undefined for an unknown id', () => {
    // result
    expect(getBrushById('missing-brush')).toBeUndefined();
  });
});
