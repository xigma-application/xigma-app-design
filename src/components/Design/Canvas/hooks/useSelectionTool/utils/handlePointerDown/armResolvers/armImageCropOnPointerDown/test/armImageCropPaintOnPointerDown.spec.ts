// store
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState } from 'store/design/types';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { armImageCropPaintOnPointerDown } from '../armImageCropPaintOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const armImageCropHandleOnPointerDownMock = vi.fn();
const armImageCropMoveOnPointerDownMock = vi.fn();

vi.mock('../armImageCropHandleOnPointerDown', () => ({
  armImageCropHandleOnPointerDown: (...args: unknown[]): unknown => armImageCropHandleOnPointerDownMock(...args),
}));

vi.mock('../armImageCropMoveOnPointerDown', () => ({
  armImageCropMoveOnPointerDown: (...args: unknown[]): unknown => armImageCropMoveOnPointerDownMock(...args),
}));

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

const node: TRectangleNode = {
  fills: [paint],
  height: 40,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 0,
  y: 0,
};

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const viewport = { x: 0, y: 0, zoom: 1 };

describe('armImageCropPaintOnPointerDown', () => {
  beforeEach(() => {
    armImageCropHandleOnPointerDownMock.mockReset();
    armImageCropMoveOnPointerDownMock.mockReset();
  });

  it('should check the image handles first when the image is the selected target, and claim the event on a hit', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' };
    armImageCropHandleOnPointerDownMock.mockReturnValue(true);
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 0, y: 0 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBe(true);
    expect(armImageCropHandleOnPointerDownMock).toHaveBeenCalledWith(
      canvas,
      canvasRefs,
      event,
      'rect-1',
      0,
      expect.any(Object),
      { x: 0, y: 0 },
      viewport,
      undefined,
      undefined,
    );
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
  });

  it('should fall through to the move check when the image is the selected target but no handle was hit', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' };
    armImageCropHandleOnPointerDownMock.mockReturnValue(false);
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before — point (20,20) is inside the seeded 0,0-40,40 crop rect
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 20, y: 20 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBe(true);
    expect(armImageCropMoveOnPointerDownMock).toHaveBeenCalledWith(
      canvas,
      canvasRefs,
      dispatch,
      event,
      'rect-1',
      imageEditor,
      { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
      { x: 20, y: 20 },
      'image',
    );
  });

  it('should arm a move drag when the point falls inside the crop rect and the frame is the selected target', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 20, y: 20 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBe(true);
    expect(armImageCropHandleOnPointerDownMock).not.toHaveBeenCalled();
    expect(armImageCropMoveOnPointerDownMock).toHaveBeenCalledWith(
      canvas,
      canvasRefs,
      dispatch,
      event,
      'rect-1',
      imageEditor,
      { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
      { x: 20, y: 20 },
      'frame',
    );
  });

  it('should switch the selected target back to frame, without claiming the event, when a miss click hits the editor’s own node', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before — point (500,500) misses the crop rect, but `hit` is the editor's own node
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 500, y: 500 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(dispatch).toHaveBeenCalledWith(setImageEditor({ ...imageEditor, selectedTarget: 'frame' }));
  });

  it('should do nothing when a miss click hits the editor’s own node while the frame is already the selected target', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 500, y: 500 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should NOT exit crop mode when the miss point is on the node's own rotate handle (regression: the rotate ring sits just outside the node's own body)", () => {
    // mock — a point 10px outside the (0,0)-(40,40) node's own nw corner, inside the rotate ring
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: -10, y: 0 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result — falls through so armRotateOnPointerDown can handle the actual rotation
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
  });

  it("should NOT exit crop mode when the miss point is on the node's own resize handle", () => {
    // mock — a point just outside the top-left corner but still inside a corner resize handle's hit box
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: -2, y: -2 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should exit the image editor and claim the event when the miss click hits nothing at all', () => {
    // mock
    const imageEditor: TImageEditorState = { mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' };
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropPaintOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 500, y: 500 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
  });
});
