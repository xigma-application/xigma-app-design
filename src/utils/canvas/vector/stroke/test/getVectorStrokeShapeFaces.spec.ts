// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getVectorStrokeShape } from '../getVectorStrokeShape';
import { getVectorStrokeShapeFaces } from '../getVectorStrokeShapeFaces';
import { makeSquareVector } from './fixtures';

describe('getVectorStrokeShapeFaces', () => {
  it('should paint the stroke shape in the stroke color', () => {
    // mock
    const node = makeSquareVector({ strokeMode: StrokeMode.dynamic });

    // before
    const faces = getVectorStrokeShapeFaces(node);

    // result
    expect(faces).toEqual([{ paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], points: getVectorStrokeShape(node)?.polygons }]);
  });

  it('should return no faces for a plain stroke', () => {
    // result
    expect(getVectorStrokeShapeFaces(makeSquareVector())).toEqual([]);
  });
});
