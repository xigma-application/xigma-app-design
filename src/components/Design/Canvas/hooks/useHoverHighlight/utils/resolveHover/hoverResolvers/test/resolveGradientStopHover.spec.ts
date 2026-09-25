// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientStopHover } from '../resolveGradientStopHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  fills: [
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ],
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

const GRADIENT_EDITOR = { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null };

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
  offsetVector: null,
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

describe('resolveGradientStopHover', () => {
  it('should return the positioning cursor when the point sits on a gradient stop', () => {
    // before — stop 0 world position: (0, 50) offset up by 22 -> (0, 28)
    const result = resolveGradientStopHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 0, y: 28 }, selectedNodes: [rectangle] }),
    );

    // result
    expect(result).toEqual({ className: 'positioning', cursor: '', nodeId: 'rect-1' });
  });

  it('should return undefined when the point is far from every stop', () => {
    const result = resolveGradientStopHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 50, y: 28 }, selectedNodes: [rectangle] }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined when there is no active gradient editor', () => {
    const result = resolveGradientStopHover(createContext({ gradientEditor: null, point: { x: 0, y: 28 }, selectedNodes: [rectangle] }));

    expect(result).toBeUndefined();
  });

  it('should set the hovered stop index when the point sits on a stop', () => {
    // mock
    const refs = createCanvasRefs();

    // before — stop 1 world position: (100, 50) offset up by 22 -> (100, 28)
    const result = resolveGradientStopHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 100, y: 28 }, refs, selectedNodes: [rectangle] }),
    );

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBe(1);
    expect(result?.className).toBe('positioning');
  });

  it('should clear the ref when the point is far from every stop', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveGradientStopHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 50, y: 28 }, refs, selectedNodes: [rectangle] }),
    );

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBeNull();
    expect(result).toBeUndefined();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveGradientStopHover(
      createContext({ gradientEditor: null, point: { x: 0, y: 28 }, refs, selectedNodes: [rectangle] }),
    );

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBeNull();
    expect(result).toBeUndefined();
  });
});
