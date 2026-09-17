// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armImageCropOnPointerDown } from '../armImageCropOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const armImageCropHandleOnPointerDownMock = vi.fn();
const armImageCropMoveOnPointerDownMock = vi.fn();

vi.mock('../armImageCropHandleOnPointerDown', () => ({
  armImageCropHandleOnPointerDown: (...args: unknown[]): unknown => armImageCropHandleOnPointerDownMock(...args),
}));

vi.mock('../armImageCropMoveOnPointerDown', () => ({
  armImageCropMoveOnPointerDown: (...args: unknown[]): unknown => armImageCropMoveOnPointerDownMock(...args),
}));

const rectangle: TRectangleNode = {
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
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

describe('armImageCropOnPointerDown', () => {
  beforeEach(() => {
    armImageCropHandleOnPointerDownMock.mockReset();
    armImageCropMoveOnPointerDownMock.mockReset();
    store.dispatch(setImageEditor(null));
  });

  it('should do nothing when there is no active image editor', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: 20, y: 20 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
  });

  it("should let a click/drag on the editor's own node proceed normally while still in position mode (no crop UI to intercept it with)", () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: rectangle,
      point: { x: 20, y: 20 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — falls through so the normal resize/select resolvers can handle it
    expect(result).toBeUndefined();
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should exit position mode and claim the event when the click misses the editor's own node entirely (regression: position mode had no guard at all, so a click on empty canvas or another node left it dangling, pointed at a node no longer selected)", () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: 20, y: 20 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
  });

  it("should NOT exit position mode when the point is on the editor's own node's rotate handle, even though it sits just outside the node's own body and misses (regression: grabbing the rotate ring around the node exited the editor before the rotate could even start)", () => {
    // mock — a point 10px outside the (0,0)-(40,40) node's own nw corner, inside the rotate ring
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: -10, y: 0 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — falls through so armRotateOnPointerDown can handle the actual rotation
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should exit position mode and claim the event when the click hits a completely different node', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();
    const otherNode: TRectangleNode = { ...rectangle, id: 'rect-2' };

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: otherNode,
      point: { x: 500, y: 500 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
  });

  it('should check the image handles first when the image is already the selected target, and claim the event on a hit', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' }));
    armImageCropHandleOnPointerDownMock.mockReturnValue(true);
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: 0, y: 0 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

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

  it('should arm a move drag when the point falls inside the crop rect, image not yet selected', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before — the crop rect seeds to the node bounds (0,0,40,40) since no crop is stored yet
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: 20, y: 20 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBe(true);
    expect(armImageCropMoveOnPointerDownMock).toHaveBeenCalledWith(
      canvas,
      canvasRefs,
      dispatch,
      event,
      'rect-1',
      expect.objectContaining({ mode: 'crop', nodeId: 'rect-1' }),
      { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
      { x: 20, y: 20 },
      'frame',
    );
  });

  it('should switch the selected target back to frame when a click elsewhere hits something, without claiming the event', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before — point (500,500) is outside the 40x40 crop rect, and something else was hit
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: rectangle,
      point: { x: 500, y: 500 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).toHaveBeenCalledWith(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'frame' }));
  });

  it('should exit the image editor itself, claiming the event, when the miss click hits nothing at all', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0, selectedTarget: 'image' }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: 500, y: 500 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — claims the event itself now, instead of falling through to armExitImageEditorOnPointerDown
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
  });

  it("should NOT exit crop mode when the point is on the frame's own rotate handle while the frame is the selected target (regression: the rotate ring sits just outside the node's own body, so it looked like a miss and closed the editor before armRotateOnPointerDown ever got a chance to rotate the frame)", () => {
    // mock — a point 10px outside the (0,0)-(40,40) node's own nw corner, inside the rotate ring
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: -10, y: 0 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — falls through so armRotateOnPointerDown can handle the actual rotation
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
  });

  it("should NOT exit crop mode when the point is on the frame's own resize handle just outside a corner, while the frame is the selected target", () => {
    // mock — a point just outside the top-left corner but still inside a corner resize handle's hit box
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: null,
      point: { x: -2, y: -2 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — falls through so armResizeOnPointerDown can handle the actual resize
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should exit the image editor and claim the event when the click hits a completely different node (regression: this used to fall through and let the other node get selected/dragged instead)', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();
    const otherNode: TRectangleNode = { ...rectangle, id: 'rect-2', x: 500, y: 500 };

    // before — point (500,500) is nowhere near our own node's crop rect, and hits a different node
    const result = armImageCropOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      hit: otherNode,
      point: { x: 500, y: 500 },
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result — the click is fully consumed: the editor closes, but the other node is never selected
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ selectedTarget: 'frame' }) }));
  });
});
