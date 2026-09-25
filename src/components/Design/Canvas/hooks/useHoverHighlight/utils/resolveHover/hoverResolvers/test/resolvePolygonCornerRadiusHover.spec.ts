// types
import { NodeType, ToolName } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getPolygonCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/polygon/getPolygonCornerRadiusHandlePosition';
import { resolvePolygonCornerRadiusHover } from '../resolvePolygonCornerRadiusHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createContext = (overrides: Partial<THoverResolverContext>): THoverResolverContext => ({
  activeTool: ToolName.default,
  editingContent: '',
  editingNodeId: null,
  editingTextBox: null,
  gradientEditor: null,
  imageEditor: null,
  isControlPressed: false,
  leafNodes: [],
  nodesById: {},
  openPropertyPanel: null,
  point: { x: 0, y: 0 },
  refs: createCanvasRefs(),
  resizableSelectedNodes: [],
  resizeHandleHit: null,
  selectedNodes: [],
  smartSelectionNodes: [],
  vectorMultiSelectBox: null,
  vectorMultiSelectResizeHandle: null,
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

const polygon: TPolygonNode = {
  cornerRadius: 20,
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

const ellipse: TEllipseNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const restHandlePosition = getPolygonCornerRadiusHandlePosition(
  { height: 100, width: 100, x: 0, y: 0 },
  3,
  20,
  IDENTITY_VIEWPORT,
  false,
  false,
);

describe('resolvePolygonCornerRadiusHover', () => {
  it("should mark the polygon's own id when the point sits precisely on its top-vertex handle dot", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolvePolygonCornerRadiusHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [polygon] }));

    // result
    expect(refs.hover.hoveredPolygonCornerRadiusHandleRef.current).toBe('polygon-1');
    expect(result?.className).toBe('radius');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the polygon, far from the top-vertex handle
    const result = resolvePolygonCornerRadiusHover(createContext({ point: { x: 50, y: 50 }, refs, resizableSelectedNodes: [polygon] }));

    // result
    expect(refs.hover.hoveredPolygonCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when nothing (or something other than a polygon) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolvePolygonCornerRadiusHover(createContext({ point: { x: 50, y: 0 }, refs, resizableSelectedNodes: [ellipse] }));

    // result
    expect(refs.hover.hoveredPolygonCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
