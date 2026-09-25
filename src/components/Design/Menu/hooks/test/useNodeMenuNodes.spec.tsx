import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useNodeMenuNodes } from '../useNodeMenuNodes';

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

const first = makeRectangle('menuNodesFirst');
const second = makeRectangle('menuNodesSecond');
const outside = makeRectangle('menuNodesOutside');

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [first, second, outside], rootIds: [first.id, second.id, outside.id] }));
});

describe('useNodeMenuNodes', () => {
  it('should return the whole selection when the clicked node is selected', () => {
    // mock
    store.dispatch(setSelection([first.id, second.id, 'missing']));

    // before
    const { result } = renderHook(() => useNodeMenuNodes(first), { wrapper });

    // result
    expect(result.current.map((node) => node.id)).toEqual([first.id, second.id]);
  });

  it('should return only the clicked node when it is not selected', () => {
    // mock
    store.dispatch(setSelection([first.id, second.id]));

    // before
    const { result } = renderHook(() => useNodeMenuNodes(outside), { wrapper });

    // result
    expect(result.current).toEqual([outside]);
  });
});
