// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorLassoOnPointerDown } from '../armVectorLassoOnPointerDown';

const hitsSelectionMock = vi.fn();

vi.mock('../hitsCurrentVectorSelection', () => ({
  hitsCurrentVectorSelection: (...args: unknown[]): unknown => hitsSelectionMock(...args),
}));

const createContext = (
  activeTool: ToolName,
): Record<string, unknown> & {
  canvasRefs: { lassoMarquee: { vectorLassoPathRef: { current: unknown } }; vectorEdit: Record<string, { current: unknown[] }> };
  setClassName: TFunc;
} => ({
  activeTool,
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: {
    lassoMarquee: { vectorLassoPathRef: { current: null } },
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: ['a'] },
    },
  },
  event: { pointerId: 2 },
  point: { x: 1, y: 2 },
  setClassName: vi.fn(),
});

describe('armVectorLassoOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the vector selection and start a lasso path from the pointer', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    hitsSelectionMock.mockReturnValue(false);
    const ctx = createContext(ToolName.lasso);

    // before
    const result = armVectorLassoOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(hitsSelectionMock).toHaveBeenCalledWith(ctx, ['v']);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 1, y: 2 }]);
    expect(ctx.setClassName).toHaveBeenCalledWith('lasso');
  });

  it('should leave the pointer to the selection when pressing on what is already selected', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    hitsSelectionMock.mockReturnValue(true);

    // result
    expect(armVectorLassoOnPointerDown(createContext(ToolName.lasso) as never)).toBeUndefined();
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorLassoOnPointerDown(createContext(ToolName.lasso) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds(['v']));
    expect(armVectorLassoOnPointerDown(createContext(ToolName.move) as never)).toBeUndefined();
  });
});
