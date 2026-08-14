// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getCurvedHitAtEvent } from '../getCurvedHitAtEvent';

const CIRCLE_BOX: TEditingTextBox = {
  flipX: false,
  flipY: false,
  height: 200,
  pathFlip: false,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  width: 200,
  x: 1000,
  y: 1000,
};

const RIGHT = { x: 1200, y: 1100 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerdown', { clientX: x, clientY: y });

describe('getCurvedHitAtEvent', () => {
  beforeEach(() => {
    store.dispatch(stopTextEdit());
  });

  it('should return null when there is no editing session', () => {
    // before
    const hit = getCurvedHitAtEvent(createCanvas(), pointerEvent(RIGHT.x, RIGHT.y));

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the editing box is not on a path', () => {
    // mock
    store.dispatch(startTextEdit({ box: { ...CIRCLE_BOX, pathId: null }, content: 'Hi' }));

    // before
    const hit = getCurvedHitAtEvent(createCanvas(), pointerEvent(RIGHT.x, RIGHT.y));

    // result
    expect(hit).toBeNull();
  });

  it('should return the nearest caret index for a point on the curved text', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    const hit = getCurvedHitAtEvent(createCanvas(), pointerEvent(RIGHT.x, RIGHT.y));

    // result
    expect(hit).toMatchObject({ index: 0 });
  });
});
