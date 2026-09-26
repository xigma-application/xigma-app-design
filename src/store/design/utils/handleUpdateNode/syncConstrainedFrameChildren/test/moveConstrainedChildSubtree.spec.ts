// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { moveConstrainedChildSubtree } from '../moveConstrainedChildSubtree';

const rectangle: TRectangleNode = {
  fills: [
    {
      crop: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
      opacity: 100,
      ref: 'asset-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    },
  ],
  height: 20,
  id: 'leaf-1',
  name: 'Rectangle',
  parentId: 'inner-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 340,
  y: 40,
};

describe('moveConstrainedChildSubtree', () => {
  it('should translate a single leaf node and carry its image crop along by the same delta', () => {
    // mock
    const child: TRectangleNode = { ...rectangle, parentId: null };
    const nodes: Record<string, TSceneNode> = { [child.id]: child };

    // before
    moveConstrainedChildSubtree(nodes, child, 10, 5);

    // result
    expect(child.x).toBe(350);
    expect(child.y).toBe(45);
    expect(child.fills[0]).toMatchObject({ crop: { height: 10, rotation: 0, width: 10, x: 10, y: 5 } });
  });

  it('should translate every node in a nested subtree by the same delta', () => {
    // mock
    const inner: TFrameNode = {
      childIds: ['leaf-1'],
      clipContent: true,
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: 100,
      id: 'inner-1',
      name: 'Inner',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 300,
      y: 20,
    };
    const leaf: TRectangleNode = { ...rectangle };
    const nodes: Record<string, TSceneNode> = { [inner.id]: inner, [leaf.id]: leaf };

    // before
    moveConstrainedChildSubtree(nodes, inner, 100, 0);

    // result — both the container and its child ride the same delta, and so does the crop
    expect(inner.x).toBe(400);
    expect(leaf.x).toBe(440);
    expect(leaf.fills[0]).toMatchObject({ crop: { height: 10, rotation: 0, width: 10, x: 100, y: 0 } });
  });

  it('should move a node without an image frame without adding any paints', () => {
    // mock
    const group = {
      childIds: [],
      height: 20,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 20,
      x: 0,
      y: 0,
    } as unknown as TSceneNode;

    // before
    moveConstrainedChildSubtree({ [group.id]: group }, group, 3, 4);

    // result
    expect(group).toMatchObject({ x: 3, y: 4 });
    expect(group).not.toHaveProperty('fills');
  });
});
