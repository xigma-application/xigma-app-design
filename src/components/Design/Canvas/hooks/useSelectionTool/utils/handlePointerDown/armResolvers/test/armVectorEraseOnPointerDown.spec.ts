// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorEraseOnPointerDown } from '../armVectorEraseOnPointerDown';

const createContext = (
  activeTool: ToolName,
): Record<string, unknown> & {
  canvasRefs: { vectorErase: { vectorEraseStrokeRef: { current: unknown } } };
  selectionRefs: { vectorEraseDragRef: { current: unknown } };
  setClassName: TFunc;
} => ({
  activeTool,
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: { vectorErase: { vectorEraseStrokeRef: { current: null } } },
  event: { pointerId: 3 },
  point: { x: 1, y: 2 },
  selectionRefs: { vectorEraseDragRef: { current: null } },
  setClassName: vi.fn(),
});

describe('armVectorEraseOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should start an erase stroke from the pointer', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    const ctx = createContext(ToolName.erase);

    // before
    const result = armVectorEraseOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.selectionRefs.vectorEraseDragRef.current).toEqual({ axisLock: null, lastPoint: { x: 1, y: 2 }, shiftAnchor: null });
    expect(ctx.canvasRefs.vectorErase.vectorEraseStrokeRef.current).toEqual([{ x: 1, y: 2 }]);
    expect(ctx.setClassName).toHaveBeenCalledWith('erase');
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorEraseOnPointerDown(createContext(ToolName.erase) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds(['v']));
    expect(armVectorEraseOnPointerDown(createContext(ToolName.move) as never)).toBeUndefined();
  });
});
