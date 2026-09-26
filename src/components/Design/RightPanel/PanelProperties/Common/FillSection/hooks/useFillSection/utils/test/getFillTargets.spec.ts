// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../AppearanceSection/types';

// utils
import { getFillTargets } from '../getFillTargets';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getFillTargets', () => {
  it('should keep the id and stroke geometry of each node', () => {
    // mock
    const nodes = [{ fills: [], id: 'a', strokeAlign: StrokeAlign.outside, strokeWidth: 2 }] as unknown as TAppearanceNode[];

    // result
    expect(getFillTargets(nodes)).toEqual([{ id: 'a', strokeAlign: StrokeAlign.outside, strokeWidth: 2 }]);
  });

  it('should carry a vector along so its fills can be written per area', () => {
    // mock
    const vector = makeSquareVector();

    // result
    expect(getFillTargets([vector])).toEqual([{ id: 'vector', strokeAlign: StrokeAlign.center, strokeWidth: 10, vector }]);
  });

  it('should keep the stroke position of a vector and leave out a zero stroke width so a first stroke gets the default one', () => {
    // mock
    const vector = { ...makeSquareVector(), strokeAlign: StrokeAlign.outside, strokeWidth: 0 };

    // result
    expect(getFillTargets([vector])).toEqual([{ id: 'vector', strokeAlign: StrokeAlign.outside, strokeWidth: undefined, vector }]);
  });

  it('should mark a line stroke as centered', () => {
    // mock
    const nodes = [{ id: 'l', strokeWidth: 3, strokes: [], type: NodeType.line }] as unknown as TAppearanceNode[];

    // result
    expect(getFillTargets(nodes)).toEqual([{ id: 'l', strokeAlign: StrokeAlign.center, strokeWidth: 3 }]);
  });
});
