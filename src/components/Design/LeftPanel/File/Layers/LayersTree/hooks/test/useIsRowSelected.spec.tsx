import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsRowSelected } from '../useIsRowSelected';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const buildNode = (id: string): TSceneNode => ({
  fill: '#ff0000',
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

describe('useIsRowSelected', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should report true for a node whose id is in the current selection', () => {
    // mock
    store.dispatch(setSelection(['a']));

    // before
    const { result } = renderHook(() => useIsRowSelected(), { wrapper });

    // result
    expect(result.current(buildNode('a'))).toBe(true);
    expect(result.current(buildNode('b'))).toBe(false);
  });
});
