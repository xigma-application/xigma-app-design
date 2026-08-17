// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TStarNode } from 'types/design/types';

// utils
import { hasStarCornerRadius } from '../hasStarCornerRadius';

const star: TStarNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.382,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

describe('hasStarCornerRadius', () => {
  it('should return true for a star node', () => {
    // result
    expect(hasStarCornerRadius(star)).toBe(true);
  });

  it('should return false for a non-star node', () => {
    // result
    expect(hasStarCornerRadius(ellipse)).toBe(false);
  });
});
