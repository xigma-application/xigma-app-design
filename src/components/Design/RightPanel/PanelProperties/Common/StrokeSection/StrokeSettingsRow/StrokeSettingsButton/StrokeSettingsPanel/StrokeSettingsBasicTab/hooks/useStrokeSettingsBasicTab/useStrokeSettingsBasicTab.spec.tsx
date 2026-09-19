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
});
