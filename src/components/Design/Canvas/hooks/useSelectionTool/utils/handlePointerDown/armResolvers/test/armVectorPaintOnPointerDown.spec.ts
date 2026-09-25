// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorPaintOnPointerDown } from '../armVectorPaintOnPointerDown';

const faceHitMock = vi.fn();
const persistMock = vi.fn();
const loopKeyAtPointMock = vi.fn();
const nestedMock = vi.fn();
const containingMock = vi.fn();
const effectiveFillMock = vi.fn();

vi.mock('../../../../../../utils/getVectorFaceAtPointAcrossOpenNodes', () => ({
  getVectorFaceAtPointAcrossOpenNodes: (...args: unknown[]): unknown => faceHitMock(...args),
}));
vi.mock('../../../../../../utils/getVectorFaceAtPoint', () => ({
  getVectorFaceAtPoint: (): unknown => ({ key: 'face', pieceKeys: ['p'], points: 'face-points' }),
}));
vi.mock('../../../../../../utils/bakeVectorNodeRotation', () => ({ bakeVectorNodeRotation: (): unknown => ({}) }));
vi.mock('utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings', () => ({
  persistVectorNetworkCrossings: (...args: unknown[]): unknown => persistMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint', () => ({
  getVectorFillLoopKeyAtPoint: (...args: unknown[]): unknown => loopKeyAtPointMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopKey', () => ({ getVectorFillLoopKey: (): string => 'new' }));
vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (): string => 'removed-points',
}));
vi.mock('utils/canvas/vectorNetwork/getNestedUnfilledLoopKeys', () => ({
  getNestedUnfilledLoopKeys: (...args: unknown[]): unknown => nestedMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getContainingFilledLoopKey', () => ({
  getContainingFilledLoopKey: (...args: unknown[]): unknown => containingMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getEffectiveVectorFill', () => ({
  getEffectiveVectorFill: (...args: unknown[]): unknown => effectiveFillMock(...args),
}));

const segments = { s: 'segment' };
const vertices = { v: 'vertex' };
const node = { fillByKey: { old: ['old-paint'] }, filledFaceKeys: ['old'], holeParentByKey: { x: 'y' }, id: 'v', segments, vertices };

const createContext = (
  activeTool = ToolName.paint,
): Record<string, unknown> & {
  canvasRefs: { vectorPaint: Record<string, { current: unknown }> };
  dispatch: TFunc;
  setClassName: TFunc;
} => ({
  activeTool,
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: {
    vectorPaint: {
      isVectorPaintRemoveRef: { current: null },
      touchedVectorPaintLoopKeysRef: { current: null },
      vectorPaintPathRef: { current: null },
      vectorPaintTouchedFacesRef: { current: null },
    },
  },
  dispatch: vi.fn(),
  event: { pointerId: 1 },
  point: { x: 1, y: 2 },
  setClassName: vi.fn(),
});

const changesOf = (ctx: { dispatch: TFunc }): Record<string, unknown> =>
  ((vi.mocked(ctx.dispatch).mock.calls[0] as unknown[])[0] as { payload: { changes: Record<string, unknown> } }).payload.changes;

describe('armVectorPaintOnPointerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(setVectorEditingNodeIds(['v']));
    faceHitMock.mockReturnValue({ node });
    persistMock.mockReturnValue({ segments, vertices });
    nestedMock.mockReturnValue([]);
    containingMock.mockReturnValue(null);
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should fill an empty face with the current paint and nested unfilled loops', () => {
    // mock
    loopKeyAtPointMock.mockReturnValue(null);
    nestedMock.mockReturnValue(['nested']);
    const ctx = createContext();

    // before
    const result = armVectorPaintOnPointerDown(ctx as never);
    const changes = changesOf(ctx);

    // result
    expect(result).toBe(true);
    expect(changes.filledFaceKeys).toEqual(['old', 'new', 'nested']);
    expect(Object.keys(changes.fillByKey as object)).toEqual(['old', 'new', 'nested']);
    expect(changes.holeParentByKey).toEqual({ x: 'y' });
    expect(changes).not.toHaveProperty('segments');
    expect(ctx.canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current).toEqual({ v: new Set(['new']) });
    expect(ctx.canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current).toEqual({ v: ['face'] });
    expect(ctx.setClassName).toHaveBeenCalledWith('paint-add');
  });

  it('should paint a hole inside a filled loop with that loop fill and remember its parent, persisting new crossings', () => {
    // mock
    loopKeyAtPointMock.mockReturnValue(null);
    containingMock.mockReturnValue('old');
    effectiveFillMock.mockReturnValue(['parent-paint']);
    persistMock.mockReturnValue({ segments: { s: 'split' }, vertices });
    const ctx = createContext();

    // before
    armVectorPaintOnPointerDown(ctx as never);
    const changes = changesOf(ctx);

    // result
    expect((changes.fillByKey as Record<string, unknown>).new).toEqual(['parent-paint']);
    expect(changes.holeParentByKey).toEqual({ new: 'old', x: 'y' });
    expect(changes.segments).toEqual({ s: 'split' });
  });

  it('should remove a filled loop and let nested loops inherit its fill', () => {
    // mock
    loopKeyAtPointMock.mockReturnValue('old');
    nestedMock.mockReturnValue(['inner']);
    effectiveFillMock.mockReturnValue(['old-paint']);
    const ctx = createContext();

    // before
    armVectorPaintOnPointerDown(ctx as never);
    const changes = changesOf(ctx);

    // result
    expect(changes.filledFaceKeys).toEqual(['inner']);
    expect(changes.fillByKey).toEqual({ inner: ['old-paint'], old: ['old-paint'] });
    expect(ctx.canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current).toEqual({ v: new Set() });
    expect(ctx.setClassName).toHaveBeenCalledWith('paint-remove');
  });

  it('should remove a filled loop without nested loops, keeping the other fills', () => {
    // mock
    loopKeyAtPointMock.mockReturnValue('old');
    const ctx = createContext();

    // before
    armVectorPaintOnPointerDown(ctx as never);

    // result
    expect(changesOf(ctx)).toMatchObject({ fillByKey: node.fillByKey, filledFaceKeys: [] });
  });

  it('should start an empty paint stroke off every face', () => {
    // mock
    faceHitMock.mockReturnValue(null);
    const ctx = createContext();

    // before
    armVectorPaintOnPointerDown(ctx as never);

    // result
    expect(ctx.dispatch).not.toHaveBeenCalled();
    expect(ctx.canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current).toEqual({});
    expect(ctx.canvasRefs.vectorPaint.vectorPaintPathRef.current).toEqual([{ x: 1, y: 2 }]);
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorPaintOnPointerDown(createContext(ToolName.move) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds([]));
    expect(armVectorPaintOnPointerDown(createContext() as never)).toBeUndefined();
  });
});
