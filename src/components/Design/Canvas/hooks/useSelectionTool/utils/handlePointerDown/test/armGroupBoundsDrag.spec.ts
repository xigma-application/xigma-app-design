import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { armGroupBoundsDrag } from '../armGroupBoundsDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('armGroupBoundsDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should arm a deselect drag for the current selection and capture the pointer', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(40, 0);
    const canvas = createCanvasMock();
    const event = { pointerId: 3 } as PointerEvent;
    const dragStateRef = createDragStateRef();

    // before
    armGroupBoundsDrag(canvas, event, dragStateRef, [idA, idB], { x: 10, y: 10 }, createCanvasRefs());

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { kind: 'deselect' }, pointerStart: { x: 10, y: 10 } });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
