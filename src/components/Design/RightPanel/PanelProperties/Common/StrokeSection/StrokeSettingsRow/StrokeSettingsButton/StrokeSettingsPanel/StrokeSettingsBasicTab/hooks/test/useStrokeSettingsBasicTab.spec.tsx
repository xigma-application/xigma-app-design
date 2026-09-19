import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { FocusEvent, ReactNode } from 'react';

// hooks
import { useStrokeSettingsBasicTab } from '../useStrokeSettingsBasicTab';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeAlign, StrokeJoin } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useStrokeSettingsBasicTab', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start solid and become dashed when the dashed style is selected', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({ hasDashes: false, isCustom: false, isDashed: false, style: 'solid' });

    // action
    act(() => result.current.onStyleSelect('dashed'));

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: false, isDashed: true, style: 'dashed' });

    // action
    act(() => result.current.onStyleSelect('custom'));

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: true, isDashed: false });
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
