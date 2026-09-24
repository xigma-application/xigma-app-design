// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isTidyableGroup } from '../isTidyableGroup';

const frame = (x: number, y = 0): TSceneNode =>
  ({ childIds: [], height: 10, rotation: 0, type: NodeType.frame, width: 10, x, y }) as unknown as TSceneNode;

// untidy: gaps of 10 and 40, so tidying moves the third layer
const untidyRow = (offset: number): TSceneNode[] => [frame(offset), frame(offset + 20), frame(offset + 70)];

describe('isTidyableGroup', () => {
  it('should accept two to ninety-nine layers that tidying would move', () => {
    // result
    expect(isTidyableGroup(untidyRow(0))).toBe(true);
    expect(isTidyableGroup([...untidyRow(0), ...Array.from({ length: 96 }, (_, index) => frame(100 + index * 20))])).toBe(true);
    expect(isTidyableGroup([frame(0), frame(0, 30), frame(0, 100)])).toBe(true);
  });

  it('should reject layers that are already tidy', () => {
    // result
    expect(isTidyableGroup([frame(0), frame(20), frame(40)])).toBe(false);
    expect(isTidyableGroup([frame(0), frame(50)])).toBe(false);
  });

  it('should reject a single layer, a hundred layers and piled-up layers', () => {
    // result
    expect(isTidyableGroup([frame(0)])).toBe(false);
    expect(isTidyableGroup([...untidyRow(0), ...Array.from({ length: 97 }, (_, index) => frame(100 + index * 20))])).toBe(false);
    expect(isTidyableGroup([frame(0), frame(2)])).toBe(false);
  });
});
