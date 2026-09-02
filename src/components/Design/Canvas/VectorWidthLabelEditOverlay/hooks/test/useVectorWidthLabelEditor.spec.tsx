import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../../../hooks/useCanvasRefs/createCanvasRefs';
import { TVectorWidthLabelRect } from '../../../utils/getVectorWidthLabelRects';
import { useVectorWidthLabelEditor } from '../useVectorWidthLabelEditor';

// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

const getVectorWidthLabelRectsMock = vi.fn();

vi.mock('../../../utils/getVectorWidthLabelRects', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../utils/getVectorWidthLabelRects')>()),
  getVectorWidthLabelRects: (...args: unknown[]): unknown => getVectorWidthLabelRectsMock(...args),
}));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const addWidthPointVectorNode = (leftOffset = 6, rightOffset = 6): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
      widthProfile: { points: { p1: { id: 'p1', leftOffset, position: 0.5, rightOffset } } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const labelRectFor = (nodeId: string): TVectorWidthLabelRect => ({
  badgeHeight: 24,
  badgeWidth: 22,
  center: { x: 50, y: -34 },
  segmentId: 's1',
  t: 0.5,
  target: { nodeId, point: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 }, side: 'right' as const },
});

const renderEditor = (): {
  canvas: HTMLCanvasElement;
  refs: TCanvasRefs;
  result: { current: ReturnType<typeof useVectorWidthLabelEditor> };
} => {
  const canvas = createCanvas();
  const refs = createCanvasRefs();
  refs.canvasRef.current = canvas;

  const { result } = renderHook(() => useVectorWidthLabelEditor(refs), { wrapper });

  return { canvas, refs, result };
};

const doubleClick = (canvas: HTMLCanvasElement, x: number, y: number): void => {
  act(() => {
    canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: x, clientY: y }));
  });
};

describe('useVectorWidthLabelEditor', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.variableWidth));
    getVectorWidthLabelRectsMock.mockReset();
  });

  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should stay idle until a double-click lands on a label rect', () => {
    // mock
    const nodeId = addWidthPointVectorNode();
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, result } = renderEditor();

    // before — double-click far from the badge
    doubleClick(canvas, 500, 500);

    // result
    expect(result.current.edit).toBeNull();
  });

  it('should open an edit seeded with the rounded total width when a double-click hits the label', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, refs, result } = renderEditor();

    // before
    doubleClick(canvas, 50, -34);

    // result
    expect(result.current.edit).toEqual({ badgeHeight: 24, badgeWidth: 22, center: { x: 50, y: -34 }, nodeId, pointId: 'p1', value: 12 });
    expect(refs.vectorWidth.editingWidthLabelRef.current).toEqual({ nodeId, pointId: 'p1' });
  });

  it('should write a symmetric taper from the new total on commit, and close', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 50, -34);

    // before
    act(() => result.current.commit('250'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { leftOffset: 125, rightOffset: 125 } } },
    });
    expect(result.current.edit).toBeNull();
    expect(refs.vectorWidth.editingWidthLabelRef.current).toBeNull();
  });

  it.each([
    ['an empty string', '   '],
    ['a negative number', '-5'],
    ['a non-number', 'abc'],
  ])('should revert to the previous value on commit of %s', (_label, raw) => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 50, -34);

    // before
    act(() => result.current.commit(raw));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { leftOffset: 6, rightOffset: 6 } } },
    });
    expect(result.current.edit).toBeNull();
  });

  it('should not dispatch when the committed value equals the current rounded total', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 50, -34);

    // before — 12 is exactly the current total
    act(() => result.current.commit('12'));

    // result — untouched, still the original symmetric 6/6
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { leftOffset: 6, rightOffset: 6 } } },
    });
  });

  it('should close without any change on cancel', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 50, -34);

    // before
    act(() => result.current.cancel());

    // result
    expect(result.current.edit).toBeNull();
    expect(refs.vectorWidth.editingWidthLabelRef.current).toBeNull();
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { leftOffset: 6, rightOffset: 6 } } },
    });
  });

  it('should be a no-op when commit is called with nothing open', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { result } = renderEditor();

    // before — no double-click happened
    act(() => result.current.commit('99'));

    // result
    expect(result.current.edit).toBeNull();
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { leftOffset: 6, rightOffset: 6 } } },
    });
  });

  it('should skip the write when the regulator’s width profile has since been dropped', () => {
    // mock
    const nodeId = addWidthPointVectorNode(6, 6);
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 50, -34);

    // before — the profile is gone by the time the edit is committed
    act(() => {
      store.dispatch(updateNode({ changes: { widthProfile: null }, id: nodeId }));
    });
    act(() => result.current.commit('250'));

    // result — no crash, nothing written, edit closed
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ widthProfile: null });
    expect(result.current.edit).toBeNull();
  });

  it('should ignore double-clicks while a different tool is active', () => {
    // mock
    const nodeId = addWidthPointVectorNode();
    getVectorWidthLabelRectsMock.mockReturnValue([labelRectFor(nodeId)]);
    store.dispatch(setActiveTool(ToolName.default));
    const { canvas, result } = renderEditor();

    // before
    doubleClick(canvas, 50, -34);

    // result
    expect(result.current.edit).toBeNull();
  });
});
