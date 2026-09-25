// store
import { addNode, setOffsetVector } from 'store/design/slice';
import { selectActivePage, selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TOffsetVectorDragState } from 'types/design/selectionTool/types';

// utils
import { continueOffsetVectorDrag } from '../continueOffsetVectorDrag';

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

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const createDragRef = (): { current: TOffsetVectorDragState | null } => ({
  current: { angle: 90, normal: { x: 0, y: 1 }, point: { x: 50, y: 10 }, startDistance: 10, startPoint: { x: 50, y: 10 } },
});

describe('continueOffsetVectorDrag', () => {
  afterEach(() => {
    store.dispatch(setOffsetVector(null));
  });

  it('should grow the distance by how far the pointer moves out across the grabbed edge, rounded and never below 0', () => {
    // mock
    store.dispatch(setOffsetVector({ distance: 10, join: StrokeJoin.miter, nodeId: addLine() }));
    const canvas = createCanvas();
    const dragRef = createDragRef();

    // action
    continueOffsetVectorDrag(canvas, new PointerEvent('pointermove', { clientX: 80, clientY: 35.4 }), store.dispatch, dragRef);

    // result
    expect(selectOffsetVector(store.getState())?.distance).toBe(35);
    expect(dragRef.current?.point).toEqual({ x: 80, y: 35.4 });

    // action
    continueOffsetVectorDrag(canvas, new PointerEvent('pointermove', { clientX: 50, clientY: -40 }), store.dispatch, dragRef);

    // result
    expect(selectOffsetVector(store.getState())?.distance).toBe(0);
  });

  it('should do nothing without a grabbed edge', () => {
    // mock
    store.dispatch(setOffsetVector({ distance: 10, join: StrokeJoin.miter, nodeId: addLine() }));

    // action
    continueOffsetVectorDrag(createCanvas(), new PointerEvent('pointermove', { clientX: 80, clientY: 90 }), store.dispatch, {
      current: null,
    });

    // result
    expect(selectOffsetVector(store.getState())?.distance).toBe(10);
  });
});
