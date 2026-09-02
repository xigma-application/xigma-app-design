// store
import { addNode, setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { previewAttachCursor } from '../previewAttachCursor';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('previewAttachCursor', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should switch to the text-on-path cursor when hovering an eligible vector path', () => {
    // mock
    store.dispatch(
      addNode({
        defaultFill: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 5000, y: 0 }, b: { id: 'b', x: 5100, y: 0 } },
      }),
    );

    const setClassName = vi.fn();

    // before
    previewAttachCursor(createCanvas(), pointerEvent(5050, 0), { x: 0, y: 0, zoom: 1 }, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('text-on-path');
  });

  it('should fall back to the drawing cursor over empty canvas', () => {
    // mock
    const setClassName = vi.fn();

    // before
    previewAttachCursor(createCanvas(), pointerEvent(9999, 9999), { x: 0, y: 0, zoom: 1 }, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('drawing');
  });
});
