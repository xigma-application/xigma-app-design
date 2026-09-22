// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgAncestorLocalTransform } from '../getSvgAncestorLocalTransform';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
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

describe('getSvgAncestorLocalTransform', () => {
  it('should return its own absolute center and rotation for a node with no parent', () => {
    const node = rect({ height: 40, rotation: 30, width: 40, x: 10, y: 10 });

    expect(getSvgAncestorLocalTransform(node, {})).toEqual({ localCenter: { x: 30, y: 30 }, localRotation: 30 });
  });

  it('should collapse to identity when every ancestor is unrotated', () => {
    const parent = rect({ height: 200, id: 'parent', rotation: 0, width: 200, x: 0, y: 0 });
    const node = rect({ height: 20, parentId: 'parent', rotation: 0, width: 20, x: 40, y: 40 });
    const nodesById: Record<string, TSceneNode> = { parent };

    expect(getSvgAncestorLocalTransform(node, nodesById)).toEqual({ localCenter: { x: 50, y: 50 }, localRotation: 0 });
  });

  it('should decompose a single rotated ancestor into a local center relative to the ancestor and a rotation delta', () => {
    // ancestor: x:100 y:100 w:100 h:100 rotation:90 -> absolute center (150,150), no parent of its own
    const ancestor = rect({ height: 100, id: 'ancestor', rotation: 90, width: 100, x: 100, y: 100 });
    // node: absolute center (180,150) rotation:90 (same as ancestor -> zero rotation of its own)
    const node = rect({ height: 20, parentId: 'ancestor', rotation: 90, width: 20, x: 170, y: 140 });
    const nodesById: Record<string, TSceneNode> = { ancestor };

    const transform = getSvgAncestorLocalTransform(node, nodesById);

    expect(transform.localRotation).toBe(0);
    expect(transform.localCenter.x).toBeCloseTo(150);
    expect(transform.localCenter.y).toBeCloseTo(120);
  });

  it('should decompose two nested rotated ancestors correctly (verified numerically by hand)', () => {
    // A: absolute center (200,200), rotation 90, no parent
    const ancestorA = rect({ height: 100, id: 'a', rotation: 90, width: 100, x: 150, y: 150 });
    // B: absolute center (250,200), rotation 135 (its own extra contribution beyond A is 45), parent A
    const ancestorB = rect({ height: 100, id: 'b', parentId: 'a', rotation: 135, width: 100, x: 200, y: 150 });
    // L: absolute center (260,200), rotation 135 (no extra rotation of its own beyond B), parent B
    const leaf = rect({ height: 20, parentId: 'b', rotation: 135, width: 20, x: 250, y: 190 });
    const nodesById: Record<string, TSceneNode> = { a: ancestorA, b: ancestorB };

    const aTransform = getSvgAncestorLocalTransform(ancestorA, nodesById);
    const bTransform = getSvgAncestorLocalTransform(ancestorB, nodesById);
    const leafTransform = getSvgAncestorLocalTransform(leaf, nodesById);

    expect(aTransform.localCenter.x).toBeCloseTo(200);
    expect(aTransform.localCenter.y).toBeCloseTo(200);
    expect(aTransform.localRotation).toBe(90);

    expect(bTransform.localCenter.x).toBeCloseTo(200);
    expect(bTransform.localCenter.y).toBeCloseTo(150);
    expect(bTransform.localRotation).toBe(45);

    expect(leafTransform.localCenter.x).toBeCloseTo(192.93, 1);
    expect(leafTransform.localCenter.y).toBeCloseTo(142.93, 1);
    expect(leafTransform.localRotation).toBe(0);
  });
});
