// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../AppearanceSection/types';

// utils
import { getFillTargets } from '../getFillTargets';

describe('getFillTargets', () => {
  it('should keep the id and stroke geometry of each node', () => {
    // mock
    const nodes = [{ fills: [], id: 'a', strokeAlign: StrokeAlign.outside, strokeWidth: 2 }] as unknown as TAppearanceNode[];

    // result
    expect(getFillTargets(nodes)).toEqual([{ id: 'a', strokeAlign: StrokeAlign.outside, strokeWidth: 2 }]);
  });

  it('should mark a line stroke as centered', () => {
    // mock
    const nodes = [{ id: 'l', strokeWidth: 3, strokes: [], type: NodeType.line }] as unknown as TAppearanceNode[];

    // result
    expect(getFillTargets(nodes)).toEqual([{ id: 'l', strokeAlign: StrokeAlign.center, strokeWidth: 3 }]);
  });
});
