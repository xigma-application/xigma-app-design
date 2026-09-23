import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSelectMatchingLayers } from '../useSelectMatchingLayers';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// utils
import { matchingNodes, matchingRootOrder } from 'store/design/utils/matchingLayers/test/matchingLayersFixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSelectMatchingLayers', () => {
  it('should select the matching layers when called', () => {
    // mock
    store.dispatch(addNodes({ nodes: matchingNodes, rootIds: matchingRootOrder }));
    store.dispatch(setSelection(['cardA1']));

    // before
    const { result } = renderHook(() => useSelectMatchingLayers(), { wrapper });

    // action
    result.current();

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['cardA1', 'cardB1']);
  });
});
