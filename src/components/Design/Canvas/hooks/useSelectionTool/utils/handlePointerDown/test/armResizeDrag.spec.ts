import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';
import { TResizeDragState } from '../../../types';

// utils
import { armResizeDrag } from '../armResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createResizeDragRef = (): RefObject<TResizeDragState | null> => ({ current: null });

const frame = (id: string, x: number, y: number, width: number, height: number): TFrameNode => ({
  fill: '#ff0000',
  height,
  id,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width,
  x,
  y,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 10,
  x2: 20,
  y1: 30,
  y2: 40,
};

describe('armResizeDrag', () => {
  it('should record the handle, bounds, aspect ratio and box-node origins, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const node = frame('a', 0, 0, 100, 50);

    // before
    armResizeDrag(canvas, pointerEvent(3), resizeDragRef, [node], 'se', { height: 50, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current).toEqual({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { a: { height: 50, width: 100, x: 0, y: 0 } },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should record x1/y1/x2/y2 origins for a line node', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [line], 'e', { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({ 'line-1': { x1: 10, x2: 20, y1: 30, y2: 40 } });
  });
});
