// store
import { setImageEditor } from 'store/design/slice';

// utils
import { armImageCropMoveOnPointerDown } from '../armImageCropMoveOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
const event = { pointerId: 1 } as PointerEvent;
const crop = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
const imageEditor = { mode: 'crop' as const, nodeId: 'node-a', paintIndex: 0 };

describe('armImageCropMoveOnPointerDown', () => {
  it('should switch the selected target to image when it was not already selected', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    armImageCropMoveOnPointerDown(canvas, canvasRefs, dispatch, event, 'node-a', imageEditor, crop, { x: 5, y: 5 }, 'frame');

    // result
    expect(dispatch).toHaveBeenCalledWith(setImageEditor({ ...imageEditor, selectedTarget: 'image' }));
  });

  it('should not re-dispatch a target switch when the image is already the selected target', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    armImageCropMoveOnPointerDown(canvas, canvasRefs, dispatch, event, 'node-a', imageEditor, crop, { x: 5, y: 5 }, 'image');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should arm the move drag with the given origin and start point regardless of the previous target', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    armImageCropMoveOnPointerDown(canvas, canvasRefs, dispatch, event, 'node-a', imageEditor, crop, { x: 5, y: 5 }, 'frame');

    // result
    expect(canvasRefs.imageCrop.imageCropMoveDragRef.current).toEqual({
      nodeId: 'node-a',
      origin: crop,
      paintIndex: 0,
      startPoint: { x: 5, y: 5 },
    });
  });
});
