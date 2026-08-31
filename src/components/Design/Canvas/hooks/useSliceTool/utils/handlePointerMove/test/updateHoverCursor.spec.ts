import { RefObject } from 'react';

// others
import { DEFAULT_CURSOR } from 'constant/canvas';

// types
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { updateHoverCursor } from '../updateHoverCursor';

vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: vi.fn((kind: string) => (kind === 'resize' ? 'url(resize.png), auto' : 'url(rotate.png), auto')),
}));

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const createSliceRef = (slice: TSliceDraft | null): RefObject<TSliceDraft | null> => ({ current: slice });

describe('updateHoverCursor', () => {
  it('should do nothing when there is no slice', () => {
    // mock
    const canvas = createCanvas();

    // before
    updateHoverCursor(canvas, pointerEvent(0, 0), createSliceRef(null));

    // result
    expect(canvas.style.cursor).toBe('');
  });

  it('should do nothing while a button is pressed', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef = createSliceRef({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    canvas.style.cursor = 'move';

    // before
    updateHoverCursor(canvas, pointerEvent(100, 100, 1), sliceRef);

    // result
    expect(canvas.style.cursor).toBe('move');
  });

  it('should show a resize cursor over a corner handle', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef = createSliceRef({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    updateHoverCursor(canvas, pointerEvent(100, 100), sliceRef);

    // result
    expect(canvas.style.cursor).toBe('url(resize.png), auto');
  });

  it('should show a rotate cursor just outside a corner handle', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef = createSliceRef({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    updateHoverCursor(canvas, pointerEvent(0, -10), sliceRef);

    // result
    expect(canvas.style.cursor).toBe('url(rotate.png), auto');
  });

  it('should clear the cursor over the rotate ring when no rotated cursor image is available yet', () => {
    // mock
    vi.mocked(getRotatedCursorUrl).mockReturnValueOnce(null);

    const canvas = createCanvas();
    const sliceRef = createSliceRef({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    canvas.style.cursor = 'wait';

    // before
    updateHoverCursor(canvas, pointerEvent(0, -10), sliceRef);

    // result
    expect(canvas.style.cursor).toBe('');
  });

  it('should clear the cursor away from every handle, including inside the body', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef = createSliceRef({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    canvas.style.cursor = 'url(resize.png), auto';

    // before
    updateHoverCursor(canvas, pointerEvent(50, 50), sliceRef);

    // result
    expect(canvas.style.cursor).toBe(DEFAULT_CURSOR);
  });
});
