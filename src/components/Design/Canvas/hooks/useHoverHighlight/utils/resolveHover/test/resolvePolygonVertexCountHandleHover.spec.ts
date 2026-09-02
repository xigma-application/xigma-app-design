// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getPolygonVertexCountHandlePosition } from 'utils/canvas/vertexCount/polygon/getPolygonVertexCountHandlePosition';
import { resolvePolygonVertexCountHandleHover } from '../resolvePolygonVertexCountHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const polygon: TPolygonNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 4,
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

const restHandlePosition = getPolygonVertexCountHandlePosition({ height: 100, width: 100, x: 0, y: 0 }, 4, 0, false, false);

describe('resolvePolygonVertexCountHandleHover', () => {
  it("should mark the polygon's own id when the point sits precisely on its vertex-count handle dot", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolvePolygonVertexCountHandleHover(restHandlePosition, [polygon], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredPolygonVertexCountHandleRef.current).toBe('polygon-1');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the polygon, far from the handle
    resolvePolygonVertexCountHandleHover({ x: 50, y: 50 }, [polygon], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredPolygonVertexCountHandleRef.current).toBeNull();
  });

  it('should clear the ref when nothing (or something other than a polygon) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolvePolygonVertexCountHandleHover(restHandlePosition, [ellipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredPolygonVertexCountHandleRef.current).toBeNull();
  });
});
