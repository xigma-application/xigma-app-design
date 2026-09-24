import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsMixedLayoutSelection } from '../useIsMixedLayoutSelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrame = (layoutMode?: LayoutMode, layoutWrap?: boolean): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height: 20,
      layoutMode,
      layoutWrap,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  return getLastAddedNodeId(store.getState());
};

const isMixed = (): boolean => renderHook(() => useIsMixedLayoutSelection(), { wrapper }).result.current;

describe('useIsMixedLayoutSelection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should treat frames with the same flow and wrap as one layout, an unset flow counting as free form', () => {
    // mock
    store.dispatch(setSelection([addFrame(LayoutMode.horizontal, true), addFrame(LayoutMode.horizontal, true)]));

    // result
    expect(isMixed()).toBe(false);

    // mock
    store.dispatch(setSelection([addFrame(), addFrame(LayoutMode.freeForm)]));

    // result
    expect(isMixed()).toBe(false);
  });

  it('should report a mixed layout when the flow or the wrap differs', () => {
    // mock
    store.dispatch(setSelection([addFrame(LayoutMode.horizontal), addFrame(LayoutMode.vertical)]));

    // result
    expect(isMixed()).toBe(true);

    // mock
    store.dispatch(setSelection([addFrame(LayoutMode.horizontal, true), addFrame(LayoutMode.horizontal)]));

    // result
    expect(isMixed()).toBe(true);
  });
});
