import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { FocusEvent, ReactNode } from 'react';

// hooks
import { useStrokeSettingsBasicTab } from './useStrokeSettingsBasicTab';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeAlign, StrokeDashCap, StrokeJoin, StrokeStyle } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addAndSelect = (): string => {
  store.dispatch(
    addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

describe('useStrokeSettingsBasicTab', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start solid and write the dashed and custom styles, dash, gap, dashes and cap to the selected node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });
    const getNode = (): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;
    const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

    // result
    expect(result.current).toMatchObject({
      dash: 20,
      dashCap: StrokeDashCap.none,
      gap: 20,
      hasDashes: false,
      isCustom: false,
      isDashed: false,
    });

    // action
    act(() => result.current.onStyleSelect(StrokeStyle.dashed));

    // result
    expect(getNode().strokeStyle).toBe(StrokeStyle.dashed);
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: false, isDashed: true });

    // action: Gap follows Dash until it is edited on its own
    act(() => result.current.onDashBlur(blur('8')));

    // result
    expect(getNode().strokeDash).toBe(8);
    expect(result.current.gap).toBe(8);

    // action
    act(() => result.current.onGapBlur(blur('3')));
    act(() => result.current.onDashCapSelect('round'));

    // result
    expect(getNode().strokeGap).toBe(3);
    expect(getNode().strokeDashCap).toBe(StrokeDashCap.round);

    // action
    act(() => result.current.onStyleSelect(StrokeStyle.custom));
    act(() => result.current.onDashesBlur(blur('10, 20, 5, 20')));

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: true, isDashed: false });
    expect(getNode().strokeDashes).toEqual([10, 20, 5, 20]);

    // action: scrubbing the left edge of Dashes shifts the whole list inside one history gesture
    act(() => result.current.onScrubDragStart());
    act(() => result.current.onDashesScrub(12));
    act(() => result.current.onScrubDragEnd());

    // result
    expect(getNode().strokeDashes).toEqual([12, 22, 7, 22]);
  });

  it('should scrub the dash and the gap of a dashed stroke from the left edge of their fields', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });
    const getNode = (): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    // action
    act(() => result.current.onStyleSelect(StrokeStyle.dashed));
    act(() => result.current.onScrubDragStart());
    act(() => result.current.onDashScrub(14));
    act(() => result.current.onGapScrub(6));
    act(() => result.current.onScrubDragEnd());

    // result
    expect(getNode().strokeDash).toBe(14);
    expect(getNode().strokeGap).toBe(6);
  });

  it('should start with the Miter join and write the chosen join to the selected node', () => {
    // before
    store.dispatch(
      addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([id]));

    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current.join).toBe(StrokeJoin.miter);

    // action
    act(() => result.current.onJoinSelect(StrokeJoin.round));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeJoin).toBe(StrokeJoin.round);
    expect(result.current.join).toBe(StrokeJoin.round);
  });

  it('should default the miter angle to 28.96 and write a clamped angle typed into the field', () => {
    // before
    store.dispatch(
      addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([id]));

    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result: an Inside stroke (the default) ignores the miter angle
    expect(result.current.miterAngle).toBe(28.96);
    expect(result.current.isMiter).toBe(false);

    // action
    act(() => {
      store.dispatch(updateNode({ changes: { strokeAlign: StrokeAlign.outside }, id }));
    });

    // result
    expect(result.current.isMiter).toBe(true);

    // action
    act(() => result.current.onMiterAngleBlur({ target: { value: '500°' } } as FocusEvent<HTMLInputElement>));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeMiterAngle).toBe(180);

    // action: scrubbing the protractor writes a clamped angle inside one history gesture
    act(() => result.current.onMiterAngleDragStart());
    act(() => result.current.onMiterAngleScrub(45.678));
    act(() => result.current.onMiterAngleDragEnd());

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeMiterAngle).toBe(45.68);

    // action
    act(() => result.current.onJoinSelect('round'));

    // result
    expect(result.current.isMiter).toBe(false);
  });

  it('should hide the dash fields and cap for a mixed Solid and Dashed selection, and apply a picked style to all', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();

    store.dispatch(updateNode({ changes: { strokeStyle: StrokeStyle.dashed }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    const readStyle = (id: string): StrokeStyle | undefined => (selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeStyle;

    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({
      hasDashes: false,
      isCustom: false,
      isDashed: false,
      isWidthProfileDisabled: true,
      style: undefined,
    });

    // action
    act(() => result.current.onStyleSelect(StrokeStyle.dashed));

    // result
    expect([readStyle(firstId), readStyle(secondId)]).toEqual([StrokeStyle.dashed, StrokeStyle.dashed]);
  });

  it('should keep the dash cap for a mixed Dashed and Custom selection but hide Dash, Gap and Dashes', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();

    store.dispatch(updateNode({ changes: { strokeStyle: StrokeStyle.dashed }, id: firstId }));
    store.dispatch(updateNode({ changes: { strokeStyle: StrokeStyle.custom }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: false, isDashed: false });
  });

  it('should show a mixed dash, write a typed dash to every node and scrub each by the same delta', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();

    store.dispatch(updateNode({ changes: { strokeDash: 4, strokeGap: 4, strokeStyle: StrokeStyle.dashed }, id: firstId }));
    store.dispatch(updateNode({ changes: { strokeDash: 10, strokeGap: 4, strokeStyle: StrokeStyle.dashed }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    const readDash = (id: string): number | undefined => (selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeDash;
    const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({ dash: undefined, gap: 4, isDashed: true });

    // action
    act(() => result.current.onDashScrub(6));

    // result
    expect([readDash(firstId), readDash(secondId)]).toEqual([6, 12]);

    // action
    act(() => result.current.onDashBlur(blur('4')));

    // result
    expect([readDash(firstId), readDash(secondId)]).toEqual([4, 4]);
  });

  it('should show no join for a mixed join and set the clicked join on every node', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();

    store.dispatch(updateNode({ changes: { strokeJoin: StrokeJoin.round }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    const readJoin = (id: string): StrokeJoin | undefined => (selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeJoin;

    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current.join).toBeUndefined();

    // action
    act(() => result.current.onJoinSelect(StrokeJoin.bevel));

    // result
    expect([readJoin(firstId), readJoin(secondId)]).toEqual([StrokeJoin.bevel, StrokeJoin.bevel]);
  });
});
