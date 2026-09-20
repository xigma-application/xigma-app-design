// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientLineHover } from '../resolveGradientLineHover';

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

describe('resolveGradientLineHover', () => {
  it('should return the drawing cursor when the point sits on the gradient line', () => {
    const result = resolveGradientLineHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 50, y: 50 }, selectedNodes: [rectangle] }),
    );

    expect(result).toEqual({ className: 'drawing', cursor: '', nodeId: 'rect-1' });
  });

  it('should return undefined when the point is too far from the line', () => {
    const result = resolveGradientLineHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 50, y: 80 }, selectedNodes: [rectangle] }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined when there is no active gradient editor', () => {
    const result = resolveGradientLineHover(createContext({ gradientEditor: null, point: { x: 50, y: 50 }, selectedNodes: [rectangle] }));

    expect(result).toBeUndefined();
  });

  it('should return undefined when the point is over an existing stop instead', () => {
    const result = resolveGradientLineHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 0, y: 28 }, selectedNodes: [rectangle] }),
    );

    expect(result).toBeUndefined();
  });
});
