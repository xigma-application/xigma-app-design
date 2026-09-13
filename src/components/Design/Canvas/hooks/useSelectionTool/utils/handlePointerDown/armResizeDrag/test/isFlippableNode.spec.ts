// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFlippableNode } from '../isFlippableNode';

const rect: TSceneNode = {
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'a',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const ellipse: TSceneNode = {
  fill: '#fff',
  height: 10,
  id: 'a',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
};

describe('isFlippableNode', () => {
  it('should return true for a flippable node type (ellipse)', () => {
    expect(isFlippableNode(ellipse)).toBe(true);
  });

  it('should return false for a non-flippable node type (rectangle)', () => {
    expect(isFlippableNode(rect)).toBe(false);
  });
});
