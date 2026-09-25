// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorShapeBuilderOnPointerDown } from '../armVectorShapeBuilderOnPointerDown';

vi.mock('../../../../../../utils/getVectorFacesOnPathAcrossOpenNodes', () => ({
  getVectorFacesOnPathAcrossOpenNodes: (): unknown => [{ faces: [{ key: 'f1' }, { key: 'f2' }], node: { id: 'v' } }],
}));

const createContext = (
  activeTool: ToolName,
  shiftKey: boolean,
  altKey: boolean,
): Record<string, unknown> & {
  canvasRefs: { shapeBuilder: Record<string, { current: unknown }> };
  setClassName: TFunc;
} => ({
  activeTool,
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: {
    shapeBuilder: {
      isVectorShapeBuilderBoxModeRef: { current: null },
      isVectorShapeBuilderSubtractRef: { current: null },
      touchedVectorShapeBuilderFacesRef: { current: null },
      vectorShapeBuilderPathRef: { current: null },
    },
  },
  event: { altKey, pointerId: 1, shiftKey },
  point: { x: 1, y: 2 },
  setClassName: vi.fn(),
});

describe('armVectorShapeBuilderOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should start an additive shape builder path, touching the faces under the pointer', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    const ctx = createContext(ToolName.shapeBuilder, false, false);

    // before
    const result = armVectorShapeBuilderOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toEqual([{ x: 1, y: 2 }]);
    expect(ctx.canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current).toEqual({ v: new Set(['f1', 'f2']) });
    expect(ctx.canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(false);
    expect(ctx.setClassName).toHaveBeenCalledWith('add');
  });

  it('should start a subtracting box-mode path with Alt and Shift', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    const ctx = createContext(ToolName.shapeBuilder, true, true);

    // before
    armVectorShapeBuilderOnPointerDown(ctx as never);

    // result
    expect(ctx.canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(true);
    expect(ctx.canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(true);
    expect(ctx.setClassName).toHaveBeenCalledWith('remove');
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorShapeBuilderOnPointerDown(createContext(ToolName.shapeBuilder, false, false) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds(['v']));
    expect(armVectorShapeBuilderOnPointerDown(createContext(ToolName.move, false, false) as never)).toBeUndefined();
  });
});
