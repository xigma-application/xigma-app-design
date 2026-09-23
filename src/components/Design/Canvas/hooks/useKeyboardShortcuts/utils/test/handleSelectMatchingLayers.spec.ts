// store
import { addNodes, setDesignHintLabelKey, setSelection } from 'store/design/slice';
import { selectDesignHintLabelKey, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleSelectMatchingLayers } from '../handleSelectMatchingLayers';
import { matchingNodes, matchingRootOrder } from 'store/design/utils/matchingLayers/test/matchingLayersFixtures';

describe('handleSelectMatchingLayers', () => {
  beforeAll(() => {
    store.dispatch(addNodes({ nodes: matchingNodes, rootIds: matchingRootOrder }));
  });

  beforeEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should select the matching layers of a nested selection', () => {
    // before
    store.dispatch(setSelection(['titleA']));

    // action
    handleSelectMatchingLayers(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['titleA', 'titleB']);
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });

  it('should show the no-matches hint when a nested selection has no matches', () => {
    // before
    store.dispatch(setSelection(['cardA2']));

    // action
    handleSelectMatchingLayers(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['cardA2']);
    expect(selectDesignHintLabelKey(store.getState())).toBe('design.toolbar.matchingLayersHint.none');
  });

  it('should leave a top-level selection unchanged and show the no-matches hint', () => {
    // before
    store.dispatch(setSelection(['screenA']));

    // action
    handleSelectMatchingLayers(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['screenA']);
    expect(selectDesignHintLabelKey(store.getState())).toBe('design.toolbar.matchingLayersHint.none');
  });
});
