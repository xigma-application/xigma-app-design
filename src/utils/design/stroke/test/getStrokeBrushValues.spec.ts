// types
import { StrokeBrushDirection } from 'types/design/enums';

// utils
import { getStrokeBrushValues } from '../getStrokeBrushValues';

describe('getStrokeBrushValues', () => {
  it('should default to Heist, right and the scatter defaults', () => {
    expect(getStrokeBrushValues(undefined)).toEqual({
      angularJitter: 180,
      brush: 'heist',
      direction: StrokeBrushDirection.right,
      gap: 45,
      rotation: 179,
      sizeJitter: 0,
      wiggle: 0,
    });
  });

  it('should use the values saved on the node', () => {
    expect(getStrokeBrushValues({ strokeBrush: 'oi', strokeBrushDirection: StrokeBrushDirection.left, strokeBrushGap: 500 })).toMatchObject(
      {
        brush: 'oi',
        direction: StrokeBrushDirection.left,
        gap: 500,
      },
    );
  });
});
