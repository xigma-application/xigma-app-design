import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useStrokeSettingsPanel } from '../useStrokeSettingsPanel';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeMode } from 'types/design/enums';
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

describe('useStrokeSettingsPanel', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start on the Basic tab and write the chosen stroke mode to the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsPanel(), { wrapper });

    // result
    expect(result.current.activeTab).toBe(StrokeMode.basic);

    // action
    act(() => result.current.onTabChange(StrokeMode.dynamic));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeMode).toBe(StrokeMode.dynamic);
    expect(result.current.activeTab).toBe(StrokeMode.dynamic);
  });

  it('should not write anything when the active tab is chosen again', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsPanel(), { wrapper });

    // action
    act(() => result.current.onTabChange(StrokeMode.basic));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeMode).toBeUndefined();
  });
});
