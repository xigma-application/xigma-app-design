import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useEllipseCornerRadius } from '../useEllipseCornerRadius';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addEllipse = (cornerRadius?: number, arcEndAngle?: number): string => {
  store.dispatch(
    addNode({
      arcEndAngle,
      cornerRadius,
      fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TEllipseNode => selectActivePage(store.getState()).nodes[id] as TEllipseNode;

describe('useEllipseCornerRadius', () => {
  it('should show the shared corner radius and commit a typed one', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // action
    act(() => result.current.onCommit('12'));

    // result
    expect(result.current.value).toBe(12);
    expect(read(id).cornerRadius).toBe(12);
  });

  it('should ignore invalid input', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // action
    act(() => result.current.onCommit('abc'));

    // result
    expect(read(id).cornerRadius).toBe(6);
  });

  it('should show Mixed for different radii and scrub each by the same amount', () => {
    // mock
    const first = addEllipse();
    const second = addEllipse(10);

    store.dispatch(setSelection([first, second]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // action
    act(() => result.current.onScrub(5));

    // result
    expect(read(first).cornerRadius).toBe(5);
    expect(read(second).cornerRadius).toBe(15);
    expect(result.current.valueLabel).toBe('Mixed');
  });

  it('should read 0 with no ellipse selected', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // result
    expect(result.current.valueLabel).toBe(0);
  });

  it('should be disabled when no selected ellipse is cut', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // result
    expect(result.current.isDisabled).toBe(true);
  });

  it('should be enabled when a selected ellipse is cut', () => {
    // mock
    const full = addEllipse(6);
    const cut = addEllipse(6, 0);

    store.dispatch(setSelection([full, cut]));

    // before
    const { result } = renderHook(() => useEllipseCornerRadius(), { wrapper });

    // result
    expect(result.current.isDisabled).toBe(false);
  });
});
