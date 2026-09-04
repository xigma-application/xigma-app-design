import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnClipContent } from '../useColumnClipContent';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnClipContent = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnClipContent>, unknown>> =>
  renderHook(() => useColumnClipContent(), { wrapper });

const addFrameNode = (clipContent: boolean): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useColumnClipContent', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should expose the selected frame clipContent', () => {
    // mock
    const frameId = addFrameNode(true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnClipContent();

    // result
    expect(result.current.clipContent).toBe(true);
  });

  it('should default to false when nothing is selected', () => {
    // before
    const { result } = renderUseColumnClipContent();

    // result
    expect(result.current.clipContent).toBe(false);
  });

  it('should toggle the frame clipContent on change', () => {
    // mock
    const frameId = addFrameNode(false);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnClipContent();

    // action
    act(() => result.current.onChange());

    // result
    expect(readNode(frameId).clipContent).toBe(true);
  });
});
