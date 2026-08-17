// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { getPolygonCornerRadiusHandleHit } from '../getPolygonCornerRadiusHandleHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const polygon: TPolygonNode = {
  cornerRadius: 15,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
};

describe('getPolygonCornerRadiusHandleHit', () => {
  it('should return null when a resize handle was already hit, without checking the polygon handle', () => {
    // mock
    const resizeHandleHit = { bounds: { height: 100, width: 100, x: 0, y: 0 }, handle: 'nw' as const, rotation: 0 };

    // result
    expect(getPolygonCornerRadiusHandleHit({ x: 50, y: 15 }, resizeHandleHit, [polygon], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the polygon corner-radius handle when no resize handle is hit', () => {
    // result — top vertex of a 100x100 triangle sits at (50, 0); radius 15 moves the handle to (50, 15)
    expect(getPolygonCornerRadiusHandleHit({ x: 50, y: 15 }, null, [polygon], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'polygon-1' });
  });

  it('should return null when the point misses the polygon handle', () => {
    // result
    expect(getPolygonCornerRadiusHandleHit({ x: 90, y: 90 }, null, [polygon], IDENTITY_VIEWPORT)).toBeNull();
  });
});
