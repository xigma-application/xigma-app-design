import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useDistributeMenu } from '../useDistributeMenu';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const selectFramesAt = (positions: { x: number; y: number }[]): void => {
  const ids = positions.map((position) => {
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [],
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

    const id = getLastAddedNodeId(store.getState());

    store.dispatch(updateNode({ changes: position, id }));

    return id;
  });

  store.dispatch(setSelection(ids));
};

const tidyUpIcon = (): string => renderHook(() => useDistributeMenu(), { wrapper }).result.current.tidyUpIcon;

describe('useDistributeMenu', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  // 20px frames with gaps of 10 and 50, so tidying moves the last one
  it("should show the Tidy up icon that matches the selection's layout", () => {
    // mock
    selectFramesAt([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 100, y: 0 },
    ]);

    // result
    expect(tidyUpIcon()).toBe('TidyUpHorizontal');

    // mock
    selectFramesAt([
      { x: 0, y: 0 },
      { x: 0, y: 30 },
      { x: 0, y: 100 },
    ]);

    // result
    expect(tidyUpIcon()).toBe('TidyUpVertical');

    // mock
    selectFramesAt([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
    ]);

    // result
    expect(tidyUpIcon()).toBe('TidyUpGrid');
  });

  it('should swap the menu trigger icon for the detected Tidy up icon while Tidy up is available', () => {
    // mock
    selectFramesAt([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
    ]);

    // before
    const { result } = renderHook(() => useDistributeMenu(), { wrapper });

    // result
    expect(result.current.triggerIcon).toBe('TidyUpGrid');
  });

  it('should fall back to the vertical Tidy up icon while Tidy up is unavailable', () => {
    // mock
    selectFramesAt([{ x: 0, y: 0 }]);

    // before
    const { result } = renderHook(() => useDistributeMenu(), { wrapper });

    // result
    expect(result.current.tidyUpIcon).toBe('TidyUpVertical');
    expect(result.current.triggerIcon).toBe('DistributeVerticalSpacing');
    expect(result.current.enabledActions.tidyUp).toBe(false);
  });
});
