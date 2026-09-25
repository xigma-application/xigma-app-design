// types
import { StrokeMode, StrokeStyle } from 'types/design/enums';

// utils
import { getVectorStrokeShapeFaces } from '../getVectorStrokeShapeFaces';
import { makeNetworkVector, makeSquareVector } from './fixtures';

const paint = [{ color: '#ff0000', opacity: 100, type: 'solid' }];

describe('getVectorStrokeShapeFaces', () => {
  it('should paint an even-odd shape as one face in the stroke color', () => {
    // before
    const faces = getVectorStrokeShapeFaces(makeSquareVector({ strokeMode: StrokeMode.dynamic }));

    // result
    expect(faces).toHaveLength(1);
    expect(faces[0].paint).toEqual(paint);
  });

  it('should paint every polygon of a nonzero shape as its own face so overlapping dashes do not cancel out', () => {
    // before
    const faces = getVectorStrokeShapeFaces(
      makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 } }, [['a', 'b']], {
        strokeDash: 10,
        strokeGap: 10,
        strokeStyle: StrokeStyle.dashed,
      }),
    );

    // result
    expect(faces).toHaveLength(5);
    expect(faces.every((face) => face.points.length === 1)).toBe(true);
  });

  it('should return no faces for a plain stroke', () => {
    // result
    expect(getVectorStrokeShapeFaces(makeSquareVector())).toEqual([]);
  });
});
