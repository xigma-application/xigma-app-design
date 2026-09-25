// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getLineBrushPolygons } from '../getLineBrushPolygons';
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

describe('getLineBrushPolygons', () => {
  it('should run the brush along the open line, from its start to its end', () => {
    // mock
    const line = makeLine({ strokeMode: StrokeMode.brush, strokeWidth: 12 });

    // before
    const [band] = getLineBrushPolygons(line, getLineFrame(line)) ?? [];
    const xs = band.map((point) => point.x);

    // result
    expect(Math.min(...xs)).toBeLessThan(5);
    expect(Math.max(...xs)).toBeGreaterThan(95);
  });
});
