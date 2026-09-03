// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { armSmartSelectionSwapDrag } from '../armSmartSelectionSwapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const addRect = (x: number, y: number, width = 50, height = 50): string =>
  store.dispatch(
    addNode({ fill: '#ff0000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }),
  ).payload.id;

describe('armSmartSelectionSwapDrag', () => {
  it('should seed the ref with every slot, its node origins and the from index, then capture the pointer', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const canvas = createCanvas();
    const swapDragRef: { current: TSmartSelectionSwapDragState | null } = { current: null };
    const slot = (id: string, x: number): { bounds: { height: number; width: number; x: number; y: number }; id: string } => ({
      bounds: { height: 50, width: 50, x, y: 0 },
      id,
    });
    const layout = { gaps: [], nodes: [slot(idA, 0), slot(idB, 100), slot(idC, 200)], type: 'row' as const };

    // before — grabbed the middle block (slot index 1)
    armSmartSelectionSwapDrag(canvas, pointerEvent(4), swapDragRef, layout, 1, { x: 125, y: 25 });

    // result
    expect(swapDragRef.current).toEqual({
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 1,
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 200, y: 0 } },
      pointerStart: { x: 125, y: 25 },
      slots: [slot(idA, 0), slot(idB, 100), slot(idC, 200)],
      targetIndex: 1,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });
});
