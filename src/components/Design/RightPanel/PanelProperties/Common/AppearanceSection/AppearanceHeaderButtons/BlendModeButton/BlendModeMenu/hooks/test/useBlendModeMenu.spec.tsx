import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useBlendModeMenu } from '../useBlendModeMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseBlendModeMenu = (): ReturnType<typeof renderHook<ReturnType<typeof useBlendModeMenu>, unknown>> =>
  renderHook(() => useBlendModeMenu(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
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

describe('useBlendModeMenu', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to Pass through when no node is selected', () => {
    expect(renderUseBlendModeMenu().result.current.value).toBe(BlendMode.passThrough);
  });

  it("should read the node's own blend mode", () => {
    const id = addRectangle({ blendMode: BlendMode.multiply });

    store.dispatch(setSelection([id]));

    expect(renderUseBlendModeMenu().result.current.value).toBe(BlendMode.multiply);
  });

  it('should commit the selected blend mode onto the node', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseBlendModeMenu();

    act(() => result.current.selectBlendMode(BlendMode.screen)());

    expect(read(id).blendMode).toBe(BlendMode.screen);
  });
});
