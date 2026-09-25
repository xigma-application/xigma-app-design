// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';
import { resolveImageTileScaleHover } from '../resolveImageTileScaleHover';

// jsdom has no real canvas 2D backend, so the actual cursor-image rotator always yields an
// empty string here — mock it the same way getRotatedCursorUrl.spec.ts does, so this test can
// assert the resolver actually reaches and calls it, independent of that environment limitation
vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: vi.fn((kind: string, angle: number) => `${kind}:${angle}`),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createNode = (rotation = 0): TRectangleNode => ({
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' }],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
});

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

describe('resolveImageTileScaleHover', () => {
  beforeEach(() => {
    // a 20x20 source at 50% scale is a 10x10 tile rect anchored at the node's own (0,0)
    imagePaintTextureSizeCache.set('image-1', { height: 20, width: 20 });
  });

  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return a resize cursor when hovering the tile rect corner handle', () => {
    // before — the tile rect's se corner sits at (10,10), far inside the 100x100 frame
    const result = resolveImageTileScaleHover(
      createContext({
        imageEditor: { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 },
        point: { x: 10, y: 10 },
        selectedNodes: [createNode()],
      }),
    );

    expect(result).toEqual({ className: null, cursor: 'resize:45', nodeId: null });
  });

  it("should return undefined at the frame's own (much larger) corner, since only the tile rect's corners are interactive", () => {
    // before
    const result = resolveImageTileScaleHover(
      createContext({
        imageEditor: { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 },
        point: { x: 100, y: 100 },
        selectedNodes: [createNode()],
      }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined when not in tile mode at all', () => {
    // before
    const result = resolveImageTileScaleHover(
      createContext({
        imageEditor: { mode: 'position', nodeId: 'rect-1', paintIndex: 0 },
        point: { x: 10, y: 10 },
        selectedNodes: [createNode()],
      }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined when the node is rotated (v1 scope: unrotated frames only)', () => {
    // before
    const result = resolveImageTileScaleHover(
      createContext({
        imageEditor: { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 },
        point: { x: 10, y: 10 },
        selectedNodes: [createNode(25)],
      }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined far away from every handle', () => {
    // before
    const result = resolveImageTileScaleHover(
      createContext({
        imageEditor: { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 },
        point: { x: 50, y: 50 },
        selectedNodes: [createNode()],
      }),
    );

    expect(result).toBeUndefined();
  });
});
