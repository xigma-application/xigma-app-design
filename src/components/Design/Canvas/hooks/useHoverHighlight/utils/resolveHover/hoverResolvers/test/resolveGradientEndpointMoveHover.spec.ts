// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientEndpointMoveHover } from '../resolveGradientEndpointMoveHover';

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

describe('resolveGradientEndpointMoveHover', () => {
  it('should return the positioning cursor when the point is within the tight move radius of an endpoint', () => {
    // before
    const result = resolveGradientEndpointMoveHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 3, y: 50 }, selectedNodes: [rectangle] }),
    );

    // result
    expect(result).toEqual({ className: 'positioning', cursor: '', nodeId: 'rect-1' });
  });

  it('should return undefined outside the move radius, leaving room for the outer rotate ring', () => {
    const result = resolveGradientEndpointMoveHover(
      createContext({ gradientEditor: GRADIENT_EDITOR, point: { x: 8, y: 50 }, selectedNodes: [rectangle] }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined when there is no active gradient editor', () => {
    const result = resolveGradientEndpointMoveHover(
      createContext({ gradientEditor: null, point: { x: 0, y: 50 }, selectedNodes: [rectangle] }),
    );

    expect(result).toBeUndefined();
  });
});
