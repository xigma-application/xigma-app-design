// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgRotatedAncestorGroups } from '../getSvgRotatedAncestorGroups';

const bounds = { height: 400, width: 400, x: 0, y: 0 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getSvgRotatedAncestorGroups', () => {
  it('should return an empty list when there is no parent', () => {
    expect(getSvgRotatedAncestorGroups(null, {}, bounds)).toEqual([]);
  });

  it('should skip an unrotated ancestor entirely', () => {
    const parent = frame({ id: 'parent', rotation: 0 });

    expect(getSvgRotatedAncestorGroups('parent', { parent }, bounds)).toEqual([]);
  });

  it('should emit one group for a single rotated ancestor, translated into the export bounds space', () => {
    const parent = frame({ height: 100, id: 'parent', rotation: 90, width: 100, x: 100, y: 100 });

    expect(getSvgRotatedAncestorGroups('parent', { parent }, { ...bounds, x: 50, y: 50 })).toEqual([
      { id: 'parent', markup: '<g transform="rotate(90, 100, 100)">' },
    ]);
  });

  it('should order groups from the outermost to the innermost rotated ancestor', () => {
    const outer = frame({ height: 100, id: 'outer', rotation: 90, width: 100, x: 150, y: 150 });
    const inner = frame({ height: 100, id: 'inner', parentId: 'outer', rotation: 135, width: 100, x: 200, y: 150 });
    const nodesById: Record<string, TSceneNode> = { inner, outer };

    const groups = getSvgRotatedAncestorGroups('inner', nodesById, bounds);

    expect(groups.map((group) => group.id)).toEqual(['outer', 'inner']);
    expect(groups[0].markup).toBe('<g transform="rotate(90, 200, 200)">');
    expect(groups[1].markup).toBe('<g transform="rotate(45, 200, 150)">');
  });

  it('should skip a middle ancestor that happens to be unrotated relative to its own parent', () => {
    const outer = frame({ height: 100, id: 'outer', rotation: 90, width: 100, x: 150, y: 150 });
    // middle carries the exact same absolute rotation as outer, so its own local contribution is 0
    const middle = frame({ height: 40, id: 'middle', parentId: 'outer', rotation: 90, width: 40, x: 180, y: 180 });
    const nodesById: Record<string, TSceneNode> = { middle, outer };

    const groups = getSvgRotatedAncestorGroups('middle', nodesById, bounds);

    expect(groups.map((group) => group.id)).toEqual(['outer']);
  });
});
