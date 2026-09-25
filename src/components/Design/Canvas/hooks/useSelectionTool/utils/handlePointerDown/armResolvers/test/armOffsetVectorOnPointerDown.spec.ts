// store
import { addNode, setOffsetVector } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';

// utils
import { armOffsetVectorOnPointerDown } from '../armOffsetVectorOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const addLine = (): string => {
  store.dispatch(
    addNode({
      height: 0,
      name: 'Line',
      parentId: null,
      rotation: 0,
      strokes: [],
      type: NodeType.line,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const createContext = (point: { x: number; y: number }): Parameters<typeof armOffsetVectorOnPointerDown>[0] => {
  const canvas = document.createElement('canvas');
  canvas.setPointerCapture = vi.fn();

  return {
    canvas,
    canvasRefs: createCanvasRefs(),
    event: new PointerEvent('pointerdown', { pointerId: 1 }),
    point,
    viewport: { x: 0, y: 0, zoom: 1 },
  } as unknown as Parameters<typeof armOffsetVectorOnPointerDown>[0];
};

describe('armOffsetVectorOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setOffsetVector(null));
  });

  it('should grab the offset outline under the pointer with the distance it starts from', () => {
    // mock
    store.dispatch(setOffsetVector({ distance: 10, join: StrokeJoin.miter, nodeId: addLine() }));
    const context = createContext({ x: 50, y: 11 });

    // before
    const result = armOffsetVectorOnPointerDown(context);

    // result
    expect(result).toBe(true);
    expect(context.canvasRefs.offsetVector.offsetVectorDragRef.current).toMatchObject({ startDistance: 10, startPoint: { x: 50, y: 11 } });
    expect(context.canvasRefs.offsetVector.offsetVectorDragRef.current?.normal.y).toBeCloseTo(1);
  });

  it('should swallow a press away from the outline while offsetting', () => {
    // mock
    store.dispatch(setOffsetVector({ distance: 10, join: StrokeJoin.miter, nodeId: addLine() }));
    const context = createContext({ x: 50, y: 60 });

    // result
    expect(armOffsetVectorOnPointerDown(context)).toBe(true);
    expect(context.canvasRefs.offsetVector.offsetVectorDragRef.current).toBeNull();
  });

  it('should leave the press to the other tools outside the offset mode', () => {
    // result
    expect(armOffsetVectorOnPointerDown(createContext({ x: 50, y: 11 }))).toBeUndefined();
  });
});
