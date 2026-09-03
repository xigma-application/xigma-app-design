import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useDuplicatePage } from '../useDuplicatePage';

// store
import { addNode, deleteNode, deletePage, setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const framePayload: Omit<TFrameNode, 'id'> = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

describe('useDuplicatePage', () => {
  const initialActivePageId = selectActivePageId(store.getState());
  const initialNodeIds = Object.keys(selectPages(store.getState())[initialActivePageId].nodes);

  afterEach(() => {
    const copyId = selectActivePageId(store.getState());

    if (copyId !== initialActivePageId) {
      store.dispatch(deletePage(copyId));
    }

    store.dispatch(setActivePage(initialActivePageId));
    Object.keys(selectPages(store.getState())[initialActivePageId].nodes)
      .filter((nodeId) => !initialNodeIds.includes(nodeId))
      .forEach((nodeId) => store.dispatch(deleteNode(nodeId)));
  });

  it('should dispatch duplicatePage and make a new active copy that clones the source nodes', () => {
    // mock
    store.dispatch(addNode(framePayload));
    const countBefore = Object.keys(selectPages(store.getState())).length;
    const { result } = renderHook(() => useDuplicatePage(initialActivePageId), { wrapper });

    // action
    result.current();

    // result
    const copyId = selectActivePageId(store.getState());

    expect(Object.keys(selectPages(store.getState()))).toHaveLength(countBefore + 1);
    expect(copyId).not.toBe(initialActivePageId);
    expect(selectPages(store.getState())[copyId].name).toContain('copy');
    expect(Object.keys(selectPages(store.getState())[copyId].nodes)).toHaveLength(1);
  });

  it('should do nothing when the page id is unknown', () => {
    // mock
    const countBefore = Object.keys(selectPages(store.getState())).length;
    const { result } = renderHook(() => useDuplicatePage('missing'), { wrapper });

    // action
    result.current();

    // result
    expect(Object.keys(selectPages(store.getState()))).toHaveLength(countBefore);
  });
});
