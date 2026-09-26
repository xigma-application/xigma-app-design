// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSelectionColorPaintsChange } from '../getSelectionColorPaintsChange';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const blue = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

describe('getSelectionColorPaintsChange', () => {
  it('should write the paints of one vector area next to the fills of its other areas', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: red, b: red } });

    // result
    expect(getSelectionColorPaintsChange(vector, undefined, 'fills', blue, 'a')).toEqual({ fillByKey: { a: blue, b: red } });
  });

  it('should build on the areas already changed for the same vector', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: red, b: red } });

    // result
    expect(getSelectionColorPaintsChange(vector, { fillByKey: { a: blue, b: red } }, 'fills', blue, 'b')).toEqual({
      fillByKey: { a: blue, b: blue },
    });
    expect(getSelectionColorPaintsChange(vector, { strokes: red }, 'fills', blue, 'b')).toEqual({ fillByKey: { a: red, b: blue } });
  });

  it('should write vector strokes and the paints of any other node by property', () => {
    // result
    expect(getSelectionColorPaintsChange(makeSquareVector(), undefined, 'strokes', blue)).toEqual({ strokes: blue });
    expect(getSelectionColorPaintsChange({ type: NodeType.rectangle } as TRectangleNode, undefined, 'fills', blue)).toEqual({
      fills: blue,
    });
  });
});
