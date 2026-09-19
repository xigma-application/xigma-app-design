// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getDynamicRingPolygons } from '../getDynamicRingPolygons';
import { getUniformRingPolygons } from '../getUniformRingPolygons';
import { rect } from './nodeFixture';

describe('getDynamicRingPolygons', () => {
  it('should draw a wobbly ring with many more points than the plain ring', () => {
    // before
    const node = rect({ strokeMode: StrokeMode.dynamic });

    // action
    const [outer] = getDynamicRingPolygons(node);

    // result
    expect(outer.length).toBeGreaterThan(getUniformRingPolygons(node)[0].length);
  });

  it('should fall back to the uniform ring without a stroke width', () => {
    // before
    const node = rect({ strokeMode: StrokeMode.dynamic, strokeWidth: 0 });

    // result
    expect(getDynamicRingPolygons(node)).toEqual(getUniformRingPolygons(node));
  });
});
