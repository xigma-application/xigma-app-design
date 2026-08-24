// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { cloneNodeWithOffset } from '../cloneNodeWithOffset';

describe('cloneNodeWithOffset', () => {
  it('should shift the geometry of a box node by the offset', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      height: 20,
      id: 'n1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 10,
      y: 10,
    };

    // action
    const clone = cloneNodeWithOffset(node, 5, 5);

    // result
    expect(clone).toMatchObject({ name: 'Frame', x: 15, y: 15 });
  });

  it('should not mutate the original node', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      height: 20,
      id: 'n1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 10,
      y: 10,
    };

    // action
    cloneNodeWithOffset(node, 5, 5);

    // result
    expect(node).toMatchObject({ x: 10, y: 10 });
  });

  it('should detach a duplicated text-on-path node from its original path', () => {
    // mock
    const node: TTextNode = {
      content: 'hello',
      fill: '#000000',
      flipX: false,
      flipY: false,
      fontFamily: 'Arial',
      fontSize: 14,
      height: 20,
      id: 'n1',
      name: 'Text',
      parentId: null,
      pathId: 'path-1',
      rotation: 0,
      type: NodeType.text,
      width: 100,
      x: 0,
      y: 0,
    };

    // action
    const clone = cloneNodeWithOffset(node, 5, 5) as TTextNode;

    // result
    expect(clone.pathId).toBeNull();
  });
});
