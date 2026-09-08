import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useRemoveNodeMask } from '../useRemoveNodeMask';

// store
import { addNode, createMaskGroup, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getIsMaskChild } from 'store/design/utils/getIsMaskChild';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useRemoveNodeMask', () => {
  it('should clear the mask flag on the given node when called', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'A',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([idA]));
    store.dispatch(createMaskGroup());
    const maskChildId = selectActivePage(store.getState()).selectedIds[0];

    // before
    const { result } = renderHook(() => useRemoveNodeMask(maskChildId), { wrapper });
    const pageBefore = selectActivePage(store.getState());
    expect(getIsMaskChild(pageBefore.nodes[maskChildId], pageBefore.nodes)).toBe(true);

    // action
    result.current();

    // result
    const pageAfter = selectActivePage(store.getState());
    expect(getIsMaskChild(pageAfter.nodes[maskChildId], pageAfter.nodes)).toBe(false);
  });
});
