// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgAncestorGroups } from '../getSvgAncestorGroups';

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

describe('getSvgAncestorGroups', () => {
  it('should return an empty list when there is no parent', () => {
    expect(getSvgAncestorGroups(null, {}, bounds, true)).toEqual([]);
  });

  it('should skip an ancestor with neither rotation nor a translatable blend mode', () => {
    const parent = frame({ id: 'parent' });

    expect(getSvgAncestorGroups('parent', { parent }, bounds, true)).toEqual([]);
  });

  it('should emit a transform-only group for a rotated ancestor when rotation transforms are allowed', () => {
    const parent = frame({ height: 100, id: 'parent', rotation: 90, width: 100, x: 100, y: 100 });

    const groups = getSvgAncestorGroups('parent', { parent }, bounds, true);

    expect(groups).toEqual([{ id: 'parent|<g transform="rotate(90, 150, 150)">', markup: '<g transform="rotate(90, 150, 150)">' }]);
  });

  it('should omit the rotation entirely when rotation transforms are not allowed for this layer', () => {
    const parent = frame({ height: 100, id: 'parent', rotation: 90, width: 100, x: 100, y: 100 });

    expect(getSvgAncestorGroups('parent', { parent }, bounds, false)).toEqual([]);
  });

  it('should emit a style-only group for a translatable blend mode, regardless of the rotation flag', () => {
    const parent = frame({ blendMode: BlendMode.multiply, id: 'parent' });
    const expected = [
      {
        id: 'parent|<g style="mix-blend-mode: multiply; isolation: isolate">',
        markup: '<g style="mix-blend-mode: multiply; isolation: isolate">',
      },
    ];

    expect(getSvgAncestorGroups('parent', { parent }, bounds, true)).toEqual(expected);
    expect(getSvgAncestorGroups('parent', { parent }, bounds, false)).toEqual(expected);
  });

  it('should skip an ancestor whose blend mode has no CSS equivalent (plusDarker/plusLighter) and no rotation', () => {
    const parent = frame({ blendMode: BlendMode.plusDarker, id: 'parent' });

    expect(getSvgAncestorGroups('parent', { parent }, bounds, true)).toEqual([]);
  });

  it('should combine both a transform and a blend style into one group when both apply', () => {
    const parent = frame({ blendMode: BlendMode.screen, height: 100, id: 'parent', rotation: 90, width: 100, x: 100, y: 100 });

    const groups = getSvgAncestorGroups('parent', { parent }, bounds, true);

    expect(groups).toEqual([
      {
        id: 'parent|<g transform="rotate(90, 150, 150)" style="mix-blend-mode: screen; isolation: isolate">',
        markup: '<g transform="rotate(90, 150, 150)" style="mix-blend-mode: screen; isolation: isolate">',
      },
    ]);
  });

  it('should order groups from the outermost to the innermost ancestor', () => {
    const outer = frame({ blendMode: BlendMode.multiply, id: 'outer' });
    const inner = frame({ blendMode: BlendMode.screen, id: 'inner', parentId: 'outer' });
    const nodesById: Record<string, TSceneNode> = { inner, outer };

    const groups = getSvgAncestorGroups('inner', nodesById, bounds, true);

    expect(groups.map((group) => group.markup)).toEqual([
      '<g style="mix-blend-mode: multiply; isolation: isolate">',
      '<g style="mix-blend-mode: screen; isolation: isolate">',
    ]);
  });
});
