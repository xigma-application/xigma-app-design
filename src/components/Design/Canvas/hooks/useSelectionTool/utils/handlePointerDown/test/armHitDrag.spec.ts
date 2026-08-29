import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { armHitDrag } from '../armHitDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 10): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('armHitDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should arm a collapse drag without replacing the selection when the hit node is part of a multi-selection', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(40, 0);
    const canvas = createCanvasMock();
    const event = { pointerId: 1 } as PointerEvent;
    const dragStateRef = createDragStateRef();
    const a = buildNode({ id: idA, x: 0, y: 0 });
    const b = buildNode({ id: idB, x: 40, y: 0 });

    store.dispatch(setSelection([idA, idB]));

    // before
    armHitDrag(canvas, event, store.dispatch, dragStateRef, a, [idA, idB], [a, b], { x: 5, y: 5 }, createCanvasRefs());

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { id: idA, kind: 'collapse' }, pointerStart: { x: 5, y: 5 } });
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should arm a collapse drag without replacing the selection when the hit node is unselected but sits inside the shared group bounds', () => {
    // mock
    const idA = addFrameNode(100, 0);
    const idB = addFrameNode(140, 0);
    const idC = addFrameNode(120, 0);
    const canvas = createCanvasMock();
    const event = { pointerId: 2 } as PointerEvent;
    const dragStateRef = createDragStateRef();
    const a = buildNode({ id: idA, x: 100, y: 0 });
    const b = buildNode({ id: idB, x: 140, y: 0 });
    const c = buildNode({ id: idC, x: 120, y: 0 });

    store.dispatch(setSelection([idA, idB]));

    // before
    armHitDrag(canvas, event, store.dispatch, dragStateRef, c, [idA, idB], [a, b], { x: 125, y: 5 }, createCanvasRefs());

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { id: idC, kind: 'collapse' }, pointerStart: { x: 125, y: 5 } });
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(2);
  });

  it('should replace the selection and arm a plain drag when the hit node is unselected and outside the shared group bounds', () => {
    // mock
    const idA = addFrameNode(200, 0);
    const idB = addFrameNode(240, 0);
    const idC = addFrameNode(500, 500);
    const canvas = createCanvasMock();
    const event = { pointerId: 3 } as PointerEvent;
    const dragStateRef = createDragStateRef();
    const a = buildNode({ id: idA, x: 200, y: 0 });
    const b = buildNode({ id: idB, x: 240, y: 0 });
    const c = buildNode({ id: idC, x: 500, y: 500 });

    store.dispatch(setSelection([idA, idB]));

    // before
    armHitDrag(canvas, event, store.dispatch, dragStateRef, c, [idA, idB], [a, b], { x: 505, y: 505 }, createCanvasRefs());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idC]);
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null, pointerStart: { x: 505, y: 505 } });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
