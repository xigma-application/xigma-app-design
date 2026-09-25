// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorCutOnPointerDown } from '../armVectorCutOnPointerDown';

const cutHitMock = vi.fn();

vi.mock('../../../../../../utils/getVectorCutHitAcrossOpenNodes', () => ({
  getVectorCutHitAcrossOpenNodes: (...args: unknown[]): unknown => cutHitMock(...args),
}));

const createContext = (
  activeTool: ToolName,
): Record<string, unknown> & {
  canvasRefs: { vectorCut: { vectorCutPreviewRef: { current: unknown } } };
  selectionRefs: { vectorCutDragRef: { current: unknown } };
  setClassName: TFunc;
} => ({
  activeTool,
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: { vectorCut: { vectorCutPreviewRef: { current: null } } },
  event: { pointerId: 3 },
  point: { x: 1, y: 2 },
  selectionRefs: { vectorCutDragRef: { current: null } },
  setClassName: vi.fn(),
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('armVectorCutOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should start a cut line from the pointer, remembering the segment it starts on', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    cutHitMock.mockReturnValue({ hit: { segmentId: 's', t: 0.5 }, node: { id: 'v' } });
    const ctx = createContext(ToolName.cut);

    // before
    const result = armVectorCutOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.selectionRefs.vectorCutDragRef.current).toEqual({
      hit: { nodeId: 'v', segmentId: 's', t: 0.5 },
      lineStart: { x: 1, y: 2 },
      status: 'pending',
    });
    expect(ctx.canvasRefs.vectorCut.vectorCutPreviewRef.current).toEqual({
      crossings: [],
      lineEnd: { x: 1, y: 2 },
      lineStart: { x: 1, y: 2 },
    });
    expect(ctx.setClassName).toHaveBeenCalledWith('cut-on');
  });

  it('should start a cut line from empty space', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    cutHitMock.mockReturnValue(null);
    const ctx = createContext(ToolName.cut);

    // before
    armVectorCutOnPointerDown(ctx as never);

    // result
    expect(ctx.selectionRefs.vectorCutDragRef.current).toMatchObject({ hit: null });
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorCutOnPointerDown(createContext(ToolName.cut) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds(['v']));
    expect(armVectorCutOnPointerDown(createContext(ToolName.move) as never)).toBeUndefined();
  });
});
