import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { armPlainResizeDrag } from '../armPlainResizeDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

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
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 10,
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

describe('armPlainResizeDrag', () => {
  it('should record bounds, aspect ratio and an origin per selected node, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const nodeA = frame('a', 0, 0, 100, 50);
    const nodeB = frame('b', 200, 0, 20, 20);

    // before
    armPlainResizeDrag(
      canvas,
      pointerEvent(3),
      resizeDragRef,
      [nodeA, nodeB],
      'se',
      { height: 50, width: 100, x: 0, y: 0 },
      createCanvasRefs(),
    );

    // result
    expect(resizeDragRef.current).toMatchObject({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {
        a: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
        b: { flip: null, height: 20, rotation: 0, width: 20, x: 200, y: 0 },
      },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should record x1/y1/x2/y2 origins for a line node', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();

    // before
    armPlainResizeDrag(canvas, pointerEvent(), resizeDragRef, [line], 'se', { height: 10, width: 10, x: 0, y: 0 }, createCanvasRefs());

    // result
    expect(resizeDragRef.current?.nodeOrigins).toEqual({ [line.id]: { x1: 0, x2: 10, y1: 0, y2: 10 } });
  });

  it('should capture a resize snapshot for a selected vector node', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const canvasRefs = createCanvasRefs();

    // before
    armPlainResizeDrag(canvas, pointerEvent(), resizeDragRef, [vector], 'se', { height: 10, width: 10, x: 0, y: 0 }, canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.has(vector.id)).toBe(true);
  });
});
