// store
import { addNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { handleWrapSelectionInSection } from '../handleWrapSelectionInSection';

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

describe('handleWrapSelectionInSection', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should wrap the selection in a new section', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('wrapA', 0), makeRectangle('wrapB', 100)], rootIds: ['wrapA', 'wrapB'] }));
    store.dispatch(setSelection(['wrapA', 'wrapB']));

    // action
    handleWrapSelectionInSection(store.dispatch);

    // result
    const [sectionId] = selectSelectedIds(store.getState());
    expect(selectNodes(store.getState())[sectionId]).toMatchObject({ childIds: ['wrapA', 'wrapB'], type: NodeType.section });
  });

  it('should do nothing while a vector is being edited', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('editingA', 500)], rootIds: ['editingA'] }));
    store.dispatch(setSelection(['editingA']));
    store.dispatch(setVectorEditingNodeIds(['editingA']));

    // action
    handleWrapSelectionInSection(store.dispatch);

    // result
    expect(selectNodes(store.getState()).editingA.parentId).toBeNull();
  });
});
