// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveImageCropRotateHover } from '../resolveImageCropRotateHover';

// jsdom has no real canvas 2D backend, so the actual cursor-image rotator always yields an
// empty string here — mock it the same way getRotatedCursorUrl.spec.ts does, so this test can
// assert the resolver actually reaches and calls it, independent of that environment limitation
vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: vi.fn((kind: string, angle: number) => `${kind}:${angle}`),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
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

describe('resolveImageCropRotateHover', () => {
  it('should return a rotate cursor when hovering just outside a crop rect corner while the image is the selected target', () => {
    // before — just outside the nw corner (0,0) of the seeded 100x100 crop rect, inside the rotate ring
    const result = resolveImageCropRotateHover(
      createContext({
        imageEditor: { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' },
        point: { x: -10, y: -10 },
        selectedNodes: [rectangle],
      }),
    );

    expect(result).toEqual({ className: null, cursor: 'rotate:270', nodeId: null });
  });

  it('should return undefined when the frame, not the image, is the selected target', () => {
    // before
    const result = resolveImageCropRotateHover(
      createContext({
        imageEditor: { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'frame' },
        point: { x: -10, y: -10 },
        selectedNodes: [rectangle],
      }),
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined inside the crop rect body', () => {
    // before
    const result = resolveImageCropRotateHover(
      createContext({
        imageEditor: { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' },
        point: { x: 50, y: 50 },
        selectedNodes: [rectangle],
      }),
    );

    expect(result).toBeUndefined();
  });
});
