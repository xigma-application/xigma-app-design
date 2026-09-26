// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSelectionColorSourcePaints } from '../getSelectionColorSourcePaints';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const blue = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

describe('getSelectionColorSourcePaints', () => {
  it('should read the fill of one area of a vector', () => {
    // result
    expect(getSelectionColorSourcePaints(makeSquareVector({ fillByKey: { a: red } }), 'fills', 'a')).toEqual(red);
  });

  it('should read the strokes of a vector and the paints of any other node', () => {
    // result
    expect(getSelectionColorSourcePaints(makeSquareVector({ strokes: blue }), 'strokes')).toEqual(blue);
    expect(getSelectionColorSourcePaints({ fills: red, type: NodeType.rectangle } as TRectangleNode, 'fills')).toEqual(red);
  });
});
