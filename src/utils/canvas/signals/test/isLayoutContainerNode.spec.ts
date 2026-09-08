// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isLayoutContainerNode } from '../isLayoutContainerNode';

const buildNode = (type: NodeType): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 20,
    id: 'node-1',
    name: 'Node',
    parentId: null,
    rotation: 0,
    type,
    width: 20,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

describe('isLayoutContainerNode', () => {
  it('should be true for a frame', () => {
    expect(isLayoutContainerNode(buildNode(NodeType.frame))).toBe(true);
  });

  it('should be true for a section', () => {
    expect(isLayoutContainerNode(buildNode(NodeType.section))).toBe(true);
  });

  it('should be false for a rectangle', () => {
    expect(isLayoutContainerNode(buildNode(NodeType.rectangle))).toBe(false);
  });

  it('should be false for a group', () => {
    expect(isLayoutContainerNode(buildNode(NodeType.group))).toBe(false);
  });
});
