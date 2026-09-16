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

  it('should do nothing while the image editor is still in position mode', () => {
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
    expect(result).toBeUndefined();
    expect(armImageCropMoveOnPointerDownMock).not.toHaveBeenCalled();
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

  it('should not dispatch a target switch when the miss click also hits nothing at all', () => {
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

    // result — falls through so armExitImageEditorOnPointerDown can close the editor
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
