import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useIsSelectionFromOneParent } from '../useIsSelectionFromOneParent';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('useIsSelectionFromOneParent', () => {
  it('should read the current selection', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('oneParentA'), makeRectangle('oneParentB')], rootIds: ['oneParentA', 'oneParentB'] }));
    store.dispatch(setSelection(['oneParentA', 'oneParentB']));

    // action
    const { result } = renderHook(() => useIsSelectionFromOneParent(), { wrapper });

    // result
    expect(result.current).toBe(true);
  });
});
