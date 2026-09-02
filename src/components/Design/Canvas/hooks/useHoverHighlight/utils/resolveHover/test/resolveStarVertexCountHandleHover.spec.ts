// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getStarVertexCountHandlePosition } from 'utils/canvas/vertexCount/star/getStarVertexCountHandlePosition';
import { resolveStarVertexCountHandleHover } from '../resolveStarVertexCountHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const star: TStarNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.4,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

const polygon: TPolygonNode = {
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

const restHandlePosition = getStarVertexCountHandlePosition({ height: 100, width: 100, x: 0, y: 0 }, 5, 0.4, 0, false, false);

describe('resolveStarVertexCountHandleHover', () => {
  it("should mark the star's own id when the point sits precisely on its vertex-count handle dot", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveStarVertexCountHandleHover(restHandlePosition, [star], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredStarVertexCountHandleRef.current).toBe('star-1');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveStarVertexCountHandleHover({ x: 50, y: 50 }, [star], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredStarVertexCountHandleRef.current).toBeNull();
  });

  it('should clear the ref when nothing (or something other than a star) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveStarVertexCountHandleHover(restHandlePosition, [polygon], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredStarVertexCountHandleRef.current).toBeNull();
  });
});
