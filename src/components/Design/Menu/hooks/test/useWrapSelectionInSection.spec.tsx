import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useWrapSelectionInSection } from '../useWrapSelectionInSection';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [],
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

describe('useWrapSelectionInSection', () => {
  it('should wrap the selected layers in a new section when called', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('hookWrap', 0)], rootIds: ['hookWrap'] }));
    store.dispatch(setSelection(['hookWrap']));

    // before
    const { result } = renderHook(() => useWrapSelectionInSection(), { wrapper });

    // action
    act(() => result.current());

    // result
    const { parentId } = selectNodes(store.getState()).hookWrap;
    expect(parentId && selectNodes(store.getState())[parentId].type).toBe(NodeType.section);
  });
});
