import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useCreateComponent } from '../useCreateComponent';

// others
import { COMPONENT_NON_MATCHING_HINT_LABEL_KEY } from '../../constants';

// store
import { addNodes, setDesignHintLabelKey, setSelection } from 'store/design/slice';
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string, parentId: string | null): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const parent: TFrameNode = {
  childIds: ['componentInner'],
  clipContent: true,
  fills: [],
  height: 100,
  id: 'componentParent',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        parent,
        makeRectangle('componentInner', 'componentParent'),
        makeRectangle('componentRootA', null),
        makeRectangle('componentRootB', null),
      ],
      rootIds: ['componentParent', 'componentRootA', 'componentRootB'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setDesignHintLabelKey(null));
});

describe('useCreateComponent', () => {
  it('should show the non-matching hint above the toolbar for layers from different parents', () => {
    // mock
    store.dispatch(setSelection(['componentInner', 'componentRootA']));

    // before
    const { result } = renderHook(() => useCreateComponent(), { wrapper });

    // action
    result.current();

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe(COMPONENT_NON_MATCHING_HINT_LABEL_KEY);
  });

  it('should show no hint for layers sharing a parent', () => {
    // mock
    store.dispatch(setSelection(['componentRootA', 'componentRootB']));

    // before
    const { result } = renderHook(() => useCreateComponent(), { wrapper });

    // action
    result.current();

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });
});
