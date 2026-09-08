// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFlipDisabledNodeType } from '../isFlipDisabledNodeType';

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

describe('isFlipDisabledNodeType', () => {
  it('should be true for a frame', () => {
    expect(isFlipDisabledNodeType(buildNode(NodeType.frame))).toBe(true);
  });

  it('should be true for a section', () => {
    expect(isFlipDisabledNodeType(buildNode(NodeType.section))).toBe(true);
  });

  it('should be false for a rectangle', () => {
    expect(isFlipDisabledNodeType(buildNode(NodeType.rectangle))).toBe(false);
  });

  it('should be false for a group', () => {
    expect(isFlipDisabledNodeType(buildNode(NodeType.group))).toBe(false);
  });
});
