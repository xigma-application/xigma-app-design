import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useBlendModeButton } from '../useBlendModeButton';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

const renderUseBlendModeButton = (): ReturnType<typeof renderHook<ReturnType<typeof useBlendModeButton>, unknown>> =>
  renderHook(() => useBlendModeButton(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('useBlendModeButton', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to Pass through, the DropEmpty icon, and closed', () => {
    // before
    const { result } = renderUseBlendModeButton();

    // result
    expect(result.current.value).toBe(BlendMode.passThrough);
    expect(result.current.icon).toBe('DropEmpty');
    expect(result.current.open).toBe(false);
  });

  it('should switch to the DropFilled icon once a non-default blend mode is set', () => {
    // before
    const id = addRectangle({ blendMode: BlendMode.multiply });

    store.dispatch(setSelection([id]));

    const { result } = renderUseBlendModeButton();

    // result
    expect(result.current.icon).toBe('DropFilled');
  });

  it('should open when requested while at the default value', () => {
    // before
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseBlendModeButton();

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });

  it('should reset a non-default blend mode to Pass through instead of opening', () => {
    // before
    const id = addRectangle({ blendMode: BlendMode.multiply });

    store.dispatch(setSelection([id]));

    const { result } = renderUseBlendModeButton();

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(false);
    expect(read(id).blendMode).toBe(BlendMode.passThrough);
  });

  it('should clear the hover preview ref when closing', () => {
    // before
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { rerender, result } = renderHook(
      () => {
        const refs = useCanvasRefsContext();
        const button = useBlendModeButton();

        return { button, refs };
      },
      { wrapper },
    );

    act(() => result.current.button.onOpenChange(true));

    result.current.refs.blendMode.previewRef.current = { blendMode: BlendMode.screen, nodeId: id };

    // action
    act(() => result.current.button.onOpenChange(false));
    rerender();

    // result
    expect(result.current.refs.blendMode.previewRef.current).toBeNull();
  });

  it('should commit the selected blend mode onto the node', () => {
    // before
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseBlendModeButton();

    // action
    act(() => result.current.selectBlendMode(BlendMode.screen)());

    // result
    expect(read(id).blendMode).toBe(BlendMode.screen);
  });
});
