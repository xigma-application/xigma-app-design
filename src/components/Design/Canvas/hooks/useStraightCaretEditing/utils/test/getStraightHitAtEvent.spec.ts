// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getStraightHitAtEvent } from '../getStraightHitAtEvent';

const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 40, rotation: 0, width: 300, x: 1000, y: 1000 };

const START = { x: 1300, y: 1040 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerdown', { clientX: x, clientY: y });

describe('getStraightHitAtEvent', () => {
  beforeEach(() => {
    store.dispatch(stopTextEdit());
  });

  it('should return null when there is no editing session', () => {
    // before
    const hit = getStraightHitAtEvent(createCanvas(), pointerEvent(START.x, START.y));

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the editing box is on a path', () => {
    // mock
    store.dispatch(startTextEdit({ box: { ...BOX, pathId: 'ellipse-1' }, content: 'Hi' }));

    // before
    const hit = getStraightHitAtEvent(createCanvas(), pointerEvent(START.x, START.y));

    // result
    expect(hit).toBeNull();
  });

  it('should return the nearest caret index for a point on the straight text', () => {
    // mock
    store.dispatch(startTextEdit({ box: BOX, content: 'Hi' }));

    // before
    const hit = getStraightHitAtEvent(createCanvas(), pointerEvent(START.x, START.y));

    // result
    expect(hit).toMatchObject({ index: 2 });
  });
});
