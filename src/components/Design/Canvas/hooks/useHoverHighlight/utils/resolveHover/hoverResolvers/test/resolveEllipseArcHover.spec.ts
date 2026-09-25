// types
import { NodeType, ToolName } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveEllipseArcHover } from '../resolveEllipseArcHover';

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

describe('resolveEllipseArcHover', () => {
  it("should mark the ellipse's own id when the point sits precisely on its Sweep handle dot", () => {
    // mock — a 100x100 ellipse at (0,0): the Sweep handle rests at (100, 50), straight right of center
    const refs = createCanvasRefs();

    // before
    const result = resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, refs, resizableSelectedNodes: [ellipse] }));

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBe('ellipse-1');
    expect(result?.className).toBe('radius');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the ellipse, far from the (100, 50) handle
    const result = resolveEllipseArcHover(createContext({ point: { x: 50, y: 50 }, refs, resizableSelectedNodes: [ellipse] }));

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when nothing (or something other than a single ellipse) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, refs, resizableSelectedNodes: [rectangle] }));

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
