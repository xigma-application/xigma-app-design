import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useGroupPanel } from '../useGroupPanel';

// store
import { addNodes, groupNodes, setSelection } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 0,
});

const selectNewGroup = (prefix: string): string => {
  const ids = [`${prefix}A`, `${prefix}B`];

  store.dispatch(addNodes({ nodes: [makeRectangle(ids[0], 0), makeRectangle(ids[1], 60)], rootIds: ids }));
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return selectSelectedIds(store.getState())[0];
};

describe('useGroupPanel', () => {
  it('should return the sections the selected group children share', () => {
    // mock
    selectNewGroup('hookPanel');

    // before
    const { result } = renderHook(() => useGroupPanel(), { wrapper });

    // result
    expect(result.current).toEqual(expect.arrayContaining(['appearance', 'cornerRadius', 'fill', 'stroke', 'effects']));
  });
});
