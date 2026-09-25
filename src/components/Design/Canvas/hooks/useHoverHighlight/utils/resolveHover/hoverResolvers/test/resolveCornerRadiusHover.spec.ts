// types
import { NodeType, ToolName } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveCornerRadiusHover } from '../resolveCornerRadiusHover';

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

const rectangle: TRectangleNode = {
  cornerRadius: 20,
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

describe('resolveCornerRadiusHover', () => {
  it('should mark the node id and resolved corner when the point sits precisely on the nw handle dot', () => {
    // mock — a 100x100 rectangle with cornerRadius 20: the nw handle rests at (20, 20)
    const refs = createCanvasRefs();

    // before
    const result = resolveCornerRadiusHover(createContext({ point: { x: 20, y: 20 }, refs, resizableSelectedNodes: [rectangle] }));

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toEqual({ corner: 'nw', nodeId: 'rect-1' });
    expect(result?.className).toBe('radius');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on a handle counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the rectangle, far from any corner handle
    const result = resolveCornerRadiusHover(createContext({ point: { x: 50, y: 50 }, refs, resizableSelectedNodes: [rectangle] }));

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when nothing (or something other than a rectangle-like node) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveCornerRadiusHover(createContext({ point: { x: 20, y: 20 }, refs, resizableSelectedNodes: [ellipse] }));

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
