// types
import { NodeType, ToolName } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';
import { resolveEllipseArcRatioHover } from '../resolveEllipseArcRatioHover';

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
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

// arcEndAngle: 0 (vs. the default arcStartAngle of 90) gives the shape an actual partial cut, which is
// what makes the Ratio handle exist at all; arcRatio: 0.5 keeps its rest position away from the center
const cutEllipse: TEllipseNode = {
  arcEndAngle: 0,
  arcRatio: 0.5,
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

const uncutEllipse: TEllipseNode = { ...cutEllipse, arcEndAngle: undefined };

const rectangle: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const restHandlePosition = getEllipseArcRatioHandlePosition(BOUNDS, 90, 0, 0.5);

describe('resolveEllipseArcRatioHover', () => {
  it("should mark the ellipse's own id when the point sits precisely on its Ratio handle dot", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveEllipseArcRatioHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [cutEllipse] }));

    // result
    expect(refs.hover.hoveredEllipseArcRatioHandleRef.current).toBe('ellipse-1');
    expect(result?.className).toBe('radius');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the ellipse, far from the handle
    const result = resolveEllipseArcRatioHover(createContext({ point: { x: 50, y: 50 }, refs, resizableSelectedNodes: [cutEllipse] }));

    // result
    expect(refs.hover.hoveredEllipseArcRatioHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when the ellipse has no cut — the Ratio handle does not exist yet', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveEllipseArcRatioHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [uncutEllipse] }));

    // result
    expect(refs.hover.hoveredEllipseArcRatioHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when nothing (or something other than a single ellipse) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveEllipseArcRatioHover(createContext({ point: restHandlePosition, refs, resizableSelectedNodes: [rectangle] }));

    // result
    expect(refs.hover.hoveredEllipseArcRatioHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
