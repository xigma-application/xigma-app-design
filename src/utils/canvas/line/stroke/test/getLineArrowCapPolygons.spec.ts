// types
import { LineEndpoint } from 'types/design/enums';

// utils
import { getLineArrowCapPolygons } from '../getLineArrowCapPolygons';
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

describe('getLineArrowCapPolygons', () => {
  it('should draw an arrowhead wider than the stroke at each arrow end', () => {
    // mock
    const line = makeLine({ endPoint: LineEndpoint.triangleArrow, startPoint: LineEndpoint.diamondArrow });

    // before
    const [start, end] = getLineArrowCapPolygons(line, getLineFrame(line));

    // result
    expect(Math.max(...start.map((point) => point.x))).toBeLessThan(50);
    expect(Math.min(...end.map((point) => point.x))).toBeGreaterThan(50);
    expect(Math.max(...start.map((point) => Math.abs(point.y)))).toBeGreaterThan(2);
    expect(Math.max(...end.map((point) => Math.abs(point.y)))).toBeGreaterThan(2);
  });

  it('should leave out plain, round and square ends', () => {
    // mock
    const line = makeLine({ endPoint: LineEndpoint.round, startPoint: LineEndpoint.square });

    // result
    expect(getLineArrowCapPolygons(line, getLineFrame(line))).toEqual([]);
    expect(getLineArrowCapPolygons(makeLine(), getLineFrame(makeLine()))).toEqual([]);
  });
});
