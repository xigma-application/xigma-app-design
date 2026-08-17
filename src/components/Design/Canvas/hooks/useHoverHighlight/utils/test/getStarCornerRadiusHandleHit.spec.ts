// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { getStarCornerRadiusHandleHit } from '../getStarCornerRadiusHandleHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const star: TStarNode = {
  cornerRadius: 15,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

describe('getStarCornerRadiusHandleHit', () => {
  it('should return null when a resize handle was already hit, without checking the star handle', () => {
    // mock
    const resizeHandleHit = { bounds: { height: 100, width: 100, x: 0, y: 0 }, handle: 'nw' as const, rotation: 0 };

    // result
    expect(getStarCornerRadiusHandleHit({ x: 50, y: 15 }, resizeHandleHit, [star], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the star corner-radius handle when no resize handle is hit', () => {
    // result — top vertex of a 100x100 5-point star sits at (50, 0); radius 15, scaled by the tip's
    expect(getStarCornerRadiusHandleHit({ x: 50, y: 33.893272 }, null, [star], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return null when the point misses the star handle', () => {
    // result
    expect(getStarCornerRadiusHandleHit({ x: 90, y: 90 }, null, [star], IDENTITY_VIEWPORT)).toBeNull();
  });
});
