import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useStrokeSettingsDynamicTab } from './useStrokeSettingsDynamicTab';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
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

describe('useStrokeSettingsDynamicTab', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to Frequency 75, Wiggle 30 and Smoothen 50', () => {
    // before
    addAndSelect();

    // action
    const { result } = renderHook(() => useStrokeSettingsDynamicTab(), { wrapper });

    // result
    expect(result.current.values).toEqual({ frequency: 75, smoothen: 50, wiggle: 30 });
  });

  it('should write a blurred value onto the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsDynamicTab(), { wrapper });

    // action
    act(() => result.current.onBlur('wiggle')({ target: { value: '80%' } } as FocusEvent<HTMLInputElement>));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeDynamicWiggle).toBe(80);
  });
});
