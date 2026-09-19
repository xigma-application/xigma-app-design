// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getBrushRingPolygons } from '../getBrushRingPolygons';
import { getUniformRingPolygons } from '../getUniformRingPolygons';
import { rect } from './nodeFixture';

describe('getBrushRingPolygons', () => {
  it('should draw the brush polygons for a known brush', () => {
    // action
    const polygons = getBrushRingPolygons(rect({ strokeBrush: 'bubblegum', strokeMode: StrokeMode.brush }));

    // result
    expect(polygons.length).toBeGreaterThan(2);
  });

  it('should fall back to the uniform ring for an unknown brush', () => {
    // before
    const node = rect({ strokeBrush: 'nope', strokeMode: StrokeMode.brush });

    // result
    expect(getBrushRingPolygons(node)).toEqual(getUniformRingPolygons(node));
  });
});
