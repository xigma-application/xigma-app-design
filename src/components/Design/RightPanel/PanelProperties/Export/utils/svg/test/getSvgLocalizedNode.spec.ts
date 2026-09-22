// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgLocalizedNode } from '../getSvgLocalizedNode';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'node',
  name: 'node',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getSvgLocalizedNode', () => {
  it('should return an equivalent clone (same x/y/rotation) for a node with no rotated ancestors', () => {
    const node = rect({ height: 40, rotation: 30, width: 40, x: 10, y: 10 });

    expect(getSvgLocalizedNode(node, {})).toEqual(node);
  });

  it('should preserve every other field (id, parentId, fills, ...) unchanged', () => {
    const node = rect({ height: 40, id: 'preserved', parentId: 'parent', rotation: 15, width: 40, x: 10, y: 10 });

    expect(getSvgLocalizedNode(node, {})).toMatchObject({ fills: node.fills, id: 'preserved', parentId: 'parent' });
  });

  it('should override x/y/rotation with the geometry decomposed relative to a rotated ancestor', () => {
    const ancestor = rect({ height: 100, id: 'ancestor', rotation: 90, width: 100, x: 100, y: 100 });
    const node = rect({ height: 20, parentId: 'ancestor', rotation: 90, width: 20, x: 170, y: 140 });
    const nodesById: Record<string, TSceneNode> = { ancestor };

    const localized = getSvgLocalizedNode(node, nodesById);

    expect(localized.rotation).toBe(0);
    expect(localized.x).toBeCloseTo(140);
    expect(localized.y).toBeCloseTo(110);
    expect(localized.width).toBe(20);
    expect(localized.height).toBe(20);
  });
});
