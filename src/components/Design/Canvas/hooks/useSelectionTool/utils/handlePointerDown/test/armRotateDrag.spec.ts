import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';
import { TRotateDragState } from '../../../types';

// utils
import { armRotateDrag } from '../armRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRotateDragRef = (): RefObject<TRotateDragState | null> => ({ current: null });

const frame = (id: string, x: number, y: number, width: number, height: number, rotation = 0): TFrameNode => ({
  fill: '#ff0000',
  height,
  id,
  name: 'Frame',
  parentId: null,
  rotation,
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

describe('armRotateDrag', () => {
  it('should record the pivot, start angle and box-node origins, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();
    const node = frame('a', 0, 0, 100, 100, 30);

    // before — the pointer starts due east of the bounds' center (50, 50), so the start angle is 0;
    armRotateDrag(canvas, pointerEvent(3), rotateDragRef, [node], { height: 100, width: 100, x: 0, y: 0 }, 30, { x: 100, y: 50 });

    // result
    expect(rotateDragRef.current).toEqual({
      cursorAngle: 30,
      nodeOrigins: { a: { height: 100, rotation: 30, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should record x1/y1/x2/y2 origins for a line node', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();

    // before
    armRotateDrag(canvas, pointerEvent(), rotateDragRef, [line], { height: 100, width: 100, x: 0, y: 0 }, 0, { x: 100, y: 50 });

    // result
    expect(rotateDragRef.current?.nodeOrigins).toEqual({ 'line-1': { x1: 10, x2: 20, y1: 30, y2: 40 } });
  });

  it('should measure the start angle from the pointer position relative to the pivot', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();
    const node = frame('a', 0, 0, 100, 100);

    // before — the pointer starts due south of the center (50, 50), which is 90 degrees
    armRotateDrag(canvas, pointerEvent(), rotateDragRef, [node], { height: 100, width: 100, x: 0, y: 0 }, 0, { x: 50, y: 150 });

    // result
    expect(rotateDragRef.current?.startAngle).toBe(90);
  });
});
