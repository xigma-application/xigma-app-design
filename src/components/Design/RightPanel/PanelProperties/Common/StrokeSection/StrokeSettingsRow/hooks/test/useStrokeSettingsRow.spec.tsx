import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { FocusEvent, ReactNode } from 'react';

// hooks
import { useStrokeSettingsRow } from '../useStrokeSettingsRow';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType, StrokeAlign, StrokeMode, StrokeSides } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addAndSelect = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const addLine = (strokeWidth: number): string => {
  store.dispatch(
    addNode({ height: 0, name: 'Line', parentId: null, rotation: 0, strokeWidth, strokes: [], type: NodeType.line, width: 40, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const blurEventFor = (value: string, defaultValue = ''): FocusEvent<HTMLInputElement> =>
  ({ target: Object.assign(document.createElement('input'), { defaultValue, value }) }) as unknown as FocusEvent<HTMLInputElement>;

describe('useStrokeSettingsRow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to an inside 1px stroke when the node has none set', () => {
    // before
    addAndSelect();

    // action
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current).toMatchObject({ position: StrokeAlign.inside, weight: 1 });
  });

  it("should read the node's stroke position and weight", () => {
    // before
    addAndSelect({ strokeAlign: StrokeAlign.center, strokeWidth: 4 });

    // action
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current).toMatchObject({ position: StrokeAlign.center, weight: 4 });
  });

  it('should write the chosen position to the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onPositionSelect(StrokeAlign.outside));

    // result
    expect(readNode(id).strokeAlign).toBe(StrokeAlign.outside);
  });

  it('should write the scrubbed weight to the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onWeightScrub(7));

    // result
    expect(readNode(id).strokeWidth).toBe(7);
  });

  it('should commit the typed weight on blur, clamped', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onWeightBlur(blurEventFor('5000')));

    // result
    expect(readNode(id).strokeWidth).toBe(1000);
  });

  it('should restore the field and leave the node untouched when the typed weight is not a number', () => {
    // before
    const id = addAndSelect({ strokeWidth: 3 });
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });
    const event = blurEventFor('abc', '3');

    // action
    act(() => result.current.onWeightBlur(event));

    // result
    expect(event.target.value).toBe('3');
    expect(readNode(id).strokeWidth).toBe(3);
  });

  it('should switch to a single side keeping the weight', () => {
    // before
    const id = addAndSelect({ strokeWidth: 4 });
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onSidesSelect(StrokeSides.top));

    // result
    expect(readNode(id)).toMatchObject({ strokeSides: StrokeSides.top, strokeWidth: 4 });
  });

  it('should report mixed when the custom sides differ and take the largest on switching back to all', () => {
    // before
    const id = addAndSelect({ strokeWidth: 4 });
    const { result, rerender } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onSidesSelect(StrokeSides.custom));
    rerender();
    act(() => result.current.onSideBlur('left')(blurEventFor('9', '4')));
    rerender();

    // result
    expect(result.current.isWeightMixed).toBe(true);

    // action
    act(() => result.current.onSidesSelect(StrokeSides.all));

    // result
    expect(readNode(id)).toMatchObject({ strokeSides: StrokeSides.all, strokeWidth: 9 });
  });

  it('should set every side when a weight is typed in custom mode', () => {
    // before
    const id = addAndSelect({ strokeWidth: 4 });
    const { result, rerender } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    act(() => result.current.onSidesSelect(StrokeSides.custom));
    rerender();

    // action
    act(() => result.current.onWeightBlur(blurEventFor('6', '4')));

    // result
    expect(readNode(id)).toMatchObject({
      strokeBottomWidth: 6,
      strokeLeftWidth: 6,
      strokeRightWidth: 6,
      strokeTopWidth: 6,
      strokeWidth: 6,
    });
  });

  it('should show a mixed weight for several nodes and write a typed weight to every one of them in one undo step', () => {
    // mock
    const firstId = addAndSelect({ strokeWidth: 1 });
    const secondId = addAndSelect({ strokeWidth: 4 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current.isWeightMixed).toBe(true);

    // action
    act(() => result.current.onWeightBlur(blurEventFor('6')));

    // result
    expect([readNode(firstId).strokeWidth, readNode(secondId).strokeWidth]).toEqual([6, 6]);

    act(() => {
      store.dispatch(undo());
    });

    expect([readNode(firstId).strokeWidth, readNode(secondId).strokeWidth]).toEqual([1, 4]);
  });

  it('should scrub the weight of every node by the same delta', () => {
    // mock
    const firstId = addAndSelect({ strokeWidth: 1 });
    const secondId = addAndSelect({ strokeWidth: 4 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => result.current.onWeightScrub(3));

    // result
    expect([readNode(firstId).strokeWidth, readNode(secondId).strokeWidth]).toEqual([3, 6]);
  });

  it('should show no position and no sides for mixed nodes and apply a picked position and sides to all', () => {
    // mock
    const firstId = addAndSelect({ strokeAlign: StrokeAlign.center, strokeSides: StrokeSides.top });
    const secondId = addAndSelect();

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current).toMatchObject({ position: undefined, sides: undefined });

    // action
    act(() => result.current.onPositionSelect(StrokeAlign.outside));
    act(() => result.current.onSidesSelect(StrokeSides.bottom));

    // result
    expect([readNode(firstId).strokeAlign, readNode(secondId).strokeAlign]).toEqual([StrokeAlign.outside, StrokeAlign.outside]);
    expect([readNode(firstId).strokeSides, readNode(secondId).strokeSides]).toEqual([StrokeSides.bottom, StrokeSides.bottom]);
  });

  it('should flag mixed stroke modes and count a non-basic stroke as centered when comparing positions', () => {
    // mock
    const insideId = addAndSelect();
    const centerId = addAndSelect({ strokeAlign: StrokeAlign.center });
    const dynamicId = addAndSelect({ strokeMode: StrokeMode.dynamic });

    store.dispatch(setSelection([insideId, dynamicId]));

    // before
    const mixed = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(mixed.result.current).toMatchObject({ isNonBasicMode: true, isStrokeModeMixed: true, position: undefined });

    // action
    store.dispatch(setSelection([centerId, dynamicId]));

    const shared = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(shared.result.current).toMatchObject({ isStrokeModeMixed: true, position: StrokeAlign.center });
  });

  it('should show the custom side fields for a mix of All and Custom, with Mixed only on sides that differ, and write a side to both', () => {
    // mock
    const allId = addAndSelect({ strokeWidth: 5 });
    const customId = addAndSelect({
      strokeBottomWidth: 5,
      strokeLeftWidth: 5,
      strokeRightWidth: 5,
      strokeSides: StrokeSides.custom,
      strokeTopWidth: 1,
      strokeWidth: 5,
    });

    store.dispatch(setSelection([allId, customId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current.sides).toBe(StrokeSides.custom);
    expect(result.current.sideWeights).toEqual({ bottom: 5, left: 5, right: 5, top: undefined });

    // action
    act(() => result.current.onSideBlur('top')(blurEventFor('3')));

    // result
    expect(readNode(allId)).toMatchObject({ strokeSides: StrokeSides.custom, strokeTopWidth: 3 });
    expect(readNode(customId)).toMatchObject({ strokeTopWidth: 3 });
  });

  it('should be mixed when one node strokes a single side', () => {
    // mock
    const allId = addAndSelect();
    const topId = addAndSelect({ strokeSides: StrokeSides.top });

    store.dispatch(setSelection([allId, topId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // result
    expect(result.current.sides).toBeUndefined();
  });

  it('should read and write the weight of a line selected with a rectangle, leaving its position and sides to the rectangle', () => {
    // mock
    const rectangleId = addAndSelect({ strokeAlign: StrokeAlign.outside, strokeWidth: 2 });
    const lineId = addLine(2);

    store.dispatch(setSelection([rectangleId, lineId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => {
      result.current.onWeightBlur(blurEventFor('6'));
    });

    // result
    expect(result.current.position).toBe(StrokeAlign.outside);
    expect(readNode(rectangleId).strokeWidth).toBe(6);
    expect((selectActivePage(store.getState()).nodes[lineId] as TLineNode).strokeWidth).toBe(6);
    expect(selectActivePage(store.getState()).nodes[lineId]).not.toHaveProperty('strokeAlign');
  });

  it('should scrub the weight of a lone line too', () => {
    // mock
    const lineId = addLine(3);

    store.dispatch(setSelection([lineId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => {
      result.current.onWeightScrub(5);
    });

    // result
    expect((selectActivePage(store.getState()).nodes[lineId] as TLineNode).strokeWidth).toBe(5);
  });

  it('should leave a lone line untouched by the position, sides and single-side edits it has no fields for', () => {
    // mock
    const lineId = addLine(3);

    store.dispatch(setSelection([lineId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => {
      result.current.onSideScrub('left')(2);
    });

    // result
    expect(selectActivePage(store.getState()).nodes[lineId]).toMatchObject({ strokeWidth: 3 });
  });

  it('should write nothing when a weight is scrubbed with nothing selected', () => {
    // mock
    store.dispatch(setSelection([]));
    const before = selectActivePage(store.getState()).nodes;

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => {
      result.current.onWeightScrub(4);
    });

    // result
    expect(selectActivePage(store.getState()).nodes).toBe(before);
  });

  it('should skip re-picking the current position or sides and restore an invalid side weight', () => {
    // mock
    const id = addAndSelect({ strokeAlign: StrokeAlign.center, strokeWidth: 4 });
    const event = blurEventFor('abc', '4');

    // before
    const { result } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    // action
    act(() => {
      result.current.onPositionSelect(StrokeAlign.center);
      result.current.onSidesSelect(StrokeSides.all);
      result.current.onSideBlur('top')(event);
    });

    // result
    expect(readNode(id)).toMatchObject({ strokeAlign: StrokeAlign.center, strokeWidth: 4 });
    expect(readNode(id).strokeSides).toBeUndefined();
    expect(event.target.value).toBe('4');
  });

  it('should scrub a single side and bracket a weight drag in one history gesture', () => {
    // mock
    const id = addAndSelect({ strokeWidth: 4 });

    // before
    const { result, rerender } = renderHook(() => useStrokeSettingsRow(), { wrapper });

    act(() => result.current.onSidesSelect(StrokeSides.custom));
    rerender();

    // action
    act(() => {
      result.current.onWeightDragStart();
      result.current.onSideScrub('left')(7);
      result.current.onWeightDragEnd();
    });

    // result
    expect(readNode(id).strokeLeftWidth).toBe(7);
  });
});
