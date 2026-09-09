import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useAutoLayoutSettingsButton } from '../useAutoLayoutSettingsButton';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderButton = (): ReturnType<typeof renderHook<ReturnType<typeof useAutoLayoutSettingsButton>, unknown>> =>
  renderHook(() => useAutoLayoutSettingsButton(), { wrapper });

const addFrame = (layoutMode: LayoutMode | undefined): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useAutoLayoutSettingsButton', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start closed', () => {
    // before
    const { result } = renderButton();

    // result
    expect(result.current.open).toBe(false);
  });

  it('should open when onOpenChange is called with true', () => {
    // before
    const { result } = renderButton();

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });

  it('should close when onClose is called', () => {
    // before
    const { result } = renderButton();

    act(() => result.current.onOpenChange(true));

    // action
    act(() => result.current.onClose());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should be undefined when no frame is selected', () => {
    // before
    const { result } = renderButton();

    // result
    expect(result.current.layoutMode).toBeUndefined();
  });

  it('should read the selected frame’s own layout mode', () => {
    // before
    const id = addFrame(LayoutMode.horizontal);
    store.dispatch(setSelection([id]));

    const { result } = renderButton();

    // result
    expect(result.current.layoutMode).toBe(LayoutMode.horizontal);
  });
});
