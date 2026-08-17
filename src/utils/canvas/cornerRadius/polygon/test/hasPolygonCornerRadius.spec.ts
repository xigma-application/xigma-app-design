// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';

// utils
import { hasPolygonCornerRadius } from '../hasPolygonCornerRadius';

const polygon: TPolygonNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
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

describe('hasPolygonCornerRadius', () => {
  it('should return true for a polygon node', () => {
    // result
    expect(hasPolygonCornerRadius(polygon)).toBe(true);
  });

  it('should return false for a non-polygon node', () => {
    // result
    expect(hasPolygonCornerRadius(ellipse)).toBe(false);
  });
});
