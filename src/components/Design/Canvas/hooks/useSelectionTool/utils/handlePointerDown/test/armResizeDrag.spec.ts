import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TLineNode, TMediaNode, TVectorNode } from 'types/design/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { armResizeDrag } from '../armResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createResizeDragRef = (): RefObject<TResizeDragState | null> => ({ current: null });

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

const vector: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
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
      nodeOrigins: { a: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
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

  it('should record vertex, segment, and live rotation origins for a vector node', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [vector], 'e', { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({
      'vector-1': {
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
      },
    });
  });

  it('should record a non-zero rotation in the vector node origin', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const rotatedVector: TVectorNode = { ...vector, rotation: 30 };

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [rotatedVector], 'e', { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toMatchObject({ 'vector-1': { rotation: 30 } });
  });

  it('should record the current flipX/flipY as the origin snapshot for a media node', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const media: TMediaNode = {
      flipX: true,
      flipY: false,
      height: 50,
      id: 'media-1',
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'a.png',
      type: NodeType.media,
      width: 100,
      x: 0,
      y: 0,
    };

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [media], 'se', { height: 50, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({
      'media-1': { flip: { x: true, y: false }, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
    });
  });

  it('should default flip to false/false for a flippable node with no flipX/flipY set at all', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const ellipse: TEllipseNode = {
      fill: '#ff0000',
      height: 50,
      id: 'ellipse-1',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 100,
      x: 0,
      y: 0,
    };

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [ellipse], 'se', { height: 50, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({
      'ellipse-1': { flip: { x: false, y: false }, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
    });
  });

  it("should snapshot a rotated node's rotation, not just its axis-aligned box", () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const node = frame('a', 0, 0, 100, 50, 30);

    // before
    armResizeDrag(canvas, pointerEvent(), resizeDragRef, [node], 'se', { height: 50, width: 100, x: 0, y: 0 });

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({ a: { flip: null, height: 50, rotation: 30, width: 100, x: 0, y: 0 } });
  });
});
