// types
import { NodeType, ToolName } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getStarCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/star/getStarCornerRadiusHandlePosition';
import { resolveStarCornerRadiusHover } from '../resolveStarCornerRadiusHover';

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

const star: TStarNode = {
  cornerRadius: 20,
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
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const restHandlePosition = getStarCornerRadiusHandlePosition(
  { height: 100, width: 100, x: 0, y: 0 },
  5,
  0.4,
  20,
  IDENTITY_VIEWPORT,
  false,
  false,
);

describe('resolveStarCornerRadiusHover', () => {
  it("should mark the star's own id when the point sits precisely on its corner-radius handle dot", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveStarCornerRadiusHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [star] }));

    // result
    expect(refs.hover.hoveredStarCornerRadiusHandleRef.current).toBe('star-1');
    expect(result?.className).toBe('radius');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveStarCornerRadiusHover(createContext({ point: { x: 50, y: 50 }, refs, resizableSelectedNodes: [star] }));

    // result
    expect(refs.hover.hoveredStarCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when nothing (or something other than a star) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveStarCornerRadiusHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [polygon] }));

    // result
    expect(refs.hover.hoveredStarCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
