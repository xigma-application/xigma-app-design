// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSelectionColorPaintSources } from '../getSelectionColorPaintSources';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const blue = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

describe('getSelectionColorPaintSources', () => {
  it('should read the fills and strokes of an appearance node', () => {
    // mock
    const rectangle = { fills: red, strokes: blue, type: NodeType.rectangle } as TRectangleNode;

    // result
    expect(getSelectionColorPaintSources(rectangle)).toEqual([
      { paints: red, property: 'fills' },
      { paints: blue, property: 'strokes' },
    ]);
  });

  it('should read the fill of every filled area of a vector and its strokes', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: red, b: blue }, filledFaceKeys: ['a', 'b'], strokes: blue });

    // result
    expect(getSelectionColorPaintSources(vector)).toEqual([
      { faceKey: 'a', paints: red, property: 'fills' },
      { faceKey: 'b', paints: blue, property: 'fills' },
      { paints: blue, property: 'strokes' },
    ]);
  });
});
