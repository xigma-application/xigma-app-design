import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

// utils
import { handleModifierKeyChange } from '../handleModifierKeyChange';

const createCanvas = (): HTMLCanvasElement => document.createElement('canvas');

describe('handleModifierKeyChange', () => {
  it('should re-run the pointer-move handler at the last known position when Control changes', () => {
    // mock
    const canvas = createCanvas();
    const lastPointerClientPositionRef: RefObject<TPoint | null> = { current: { x: 10, y: 20 } };
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      canvas,
      new KeyboardEvent('keydown', { ctrlKey: true, key: 'Control' }),
      lastPointerClientPositionRef,
      onPointerMove,
    );

    // result
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    const [passedCanvas, syntheticEvent] = onPointerMove.mock.calls[0] as [HTMLCanvasElement, PointerEvent];
    expect(passedCanvas).toBe(canvas);
    expect(syntheticEvent.clientX).toBe(10);
    expect(syntheticEvent.clientY).toBe(20);
    expect(syntheticEvent.ctrlKey).toBe(true);
  });

  it('should re-run the pointer-move handler when Meta changes', () => {
    // mock
    const canvas = createCanvas();
    const lastPointerClientPositionRef: RefObject<TPoint | null> = { current: { x: 30, y: 40 } };
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      canvas,
      new KeyboardEvent('keyup', { key: 'Meta', metaKey: true }),
      lastPointerClientPositionRef,
      onPointerMove,
    );

    // result
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    const [, syntheticEvent] = onPointerMove.mock.calls[0] as [HTMLCanvasElement, PointerEvent];
    expect(syntheticEvent.metaKey).toBe(true);
  });

  it('should do nothing for an unrelated key', () => {
    // mock
    const canvas = createCanvas();
    const lastPointerClientPositionRef: RefObject<TPoint | null> = { current: { x: 10, y: 20 } };
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      canvas,
      new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }),
      lastPointerClientPositionRef,
      onPointerMove,
    );

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });

  it('should do nothing when the pointer has never moved over the canvas', () => {
    // mock
    const canvas = createCanvas();
    const lastPointerClientPositionRef: RefObject<TPoint | null> = { current: null };
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      canvas,
      new KeyboardEvent('keydown', { ctrlKey: true, key: 'Control' }),
      lastPointerClientPositionRef,
      onPointerMove,
    );

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });
});
