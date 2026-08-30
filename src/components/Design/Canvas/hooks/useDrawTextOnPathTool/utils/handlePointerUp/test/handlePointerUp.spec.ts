import { RefObject } from 'react';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectActivePage, selectActiveTool } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1 });

const createPointRef = (value: TPoint | null): RefObject<TPoint | null> => ({ current: value });
const createStringRef = (value: string | null): RefObject<string | null> => ({ current: value });
const createDraftRef = (value: TDraftEntity | null = null): RefObject<TDraftEntity | null> => ({ current: value });

const addStraightVector = (offsetX: number): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: offsetX, y: 0 }, b: { id: 'b', x: offsetX + 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.textOnPath));
  });

  it('should attach to the armed vector, clear the gesture refs, and revert to the default tool', () => {
    // mock
    const vectorId = addStraightVector(8000);
    const canvas = createCanvas();
    const startRef = createPointRef({ x: 8010, y: 10 });
    const attachTargetIdRef = createStringRef(vectorId);
    const draftRef = createDraftRef();

    // before
    handlePointerUp(canvas, pointerEvent(8050, 0), store.dispatch, { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef);

    // result
    expect(selectActivePage(store.getState()).nodes[vectorId]).toMatchObject({ fillColor: null });
    expect(startRef.current).toBeNull();
    expect(attachTargetIdRef.current).toBeNull();
    expect(draftRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(selectActiveTool(store.getState())).toBe(ToolName.default);
  });

  it('should draw a new ellipse path when nothing is armed, then revert to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createPointRef({ x: 9000, y: 0 });
    const attachTargetIdRef = createStringRef(null);
    const draftRef = createDraftRef();

    // before
    handlePointerUp(canvas, pointerEvent(9100, 100), store.dispatch, { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef);

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const pathNodeId = rootOrder[rootOrder.length - 1];

    expect(nodes[pathNodeId]).toMatchObject({ pathType: PathType.ellipse, type: NodeType.path });
    expect(startRef.current).toBeNull();
    expect(draftRef.current).toBeNull();
    expect(selectActiveTool(store.getState())).toBe(ToolName.default);
  });

  it('should be a no-op beyond ending the history gesture when no gesture is in progress', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createPointRef(null);
    const attachTargetIdRef = createStringRef(null);
    const draftRef = createDraftRef();
    const { rootOrder: before } = selectActivePage(store.getState());

    // before
    handlePointerUp(canvas, pointerEvent(0, 0), store.dispatch, { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef);

    // result — no new node, tool untouched, no pointer-capture release
    expect(selectActivePage(store.getState()).rootOrder).toEqual(before);
    expect(selectActiveTool(store.getState())).toBe(ToolName.textOnPath);
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });
});
