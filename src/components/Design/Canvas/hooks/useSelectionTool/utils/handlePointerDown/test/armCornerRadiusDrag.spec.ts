import { RefObject } from 'react';

// types
import { TCornerRadiusDragState } from '../../../types';

// utils
import { armCornerRadiusDrag } from '../armCornerRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createCornerRadiusDragRef = (): RefObject<TCornerRadiusDragState | null> => ({ current: null });

describe('armCornerRadiusDrag', () => {
  it('should resolve the corner immediately when there is only one candidate, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef();

    // before
    armCornerRadiusDrag(canvas, pointerEvent(3), cornerRadiusDragRef, { height: 50, width: 100, x: 0, y: 0 }, ['ne'], 'node-a', 30, {
      x: 80,
      y: 10,
    });

    // result
    expect(cornerRadiusDragRef.current).toEqual({
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      candidates: ['ne'],
      corner: 'ne',
      nodeId: 'node-a',
      pointerStart: { x: 80, y: 10 },
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should leave the corner unresolved when several handles coincided at the click point', () => {
    // mock
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef();

    // before
    armCornerRadiusDrag(
      canvas,
      pointerEvent(),
      cornerRadiusDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      ['ne', 'nw', 'se', 'sw'],
      'node-a',
      0,
      {
        x: 50,
        y: 50,
      },
    );

    // result
    expect(cornerRadiusDragRef.current).toMatchObject({ candidates: ['ne', 'nw', 'se', 'sw'], corner: null });
  });
});
