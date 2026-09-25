// others
import { SECTION_FILL } from 'components/Design/Canvas/constants';

// store
import { addNodes, moveNodes, setSelection, wrapInSection } from 'store/design/slice';
import { selectActivePage, selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

const makeRectangle = (id: string, x: number, y: number): TRectangleNode => ({
  fills: [],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y,
});

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 400,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 1000,
  y: 0,
};

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [makeRectangle('a', 100, 100), makeRectangle('b', 200, 150), makeRectangle('inFrame', 1100, 100), frame],
      rootIds: ['a', 'b', 'inFrame', 'frame'],
    }),
  );
  store.dispatch(moveNodes({ nodeIds: ['inFrame'], targetIndex: 0, targetParentId: 'frame' }));
});

describe('handleWrapInSection', () => {
  it('should wrap the selected top-level layers in a new selected section 25px larger than them on every side', () => {
    // mock
    store.dispatch(setSelection(['a', 'b']));

    // action
    store.dispatch(wrapInSection());

    // result
    const [sectionId] = selectSelectedIds(store.getState());
    expect(selectNodes(store.getState())[sectionId]).toMatchObject({
      childIds: ['a', 'b'],
      fill: SECTION_FILL,
      height: 140,
      name: 'Section (1)',
      parentId: null,
      type: NodeType.section,
      width: 190,
      x: 75,
      y: 75,
    });
    expect(selectActivePage(store.getState()).rootOrder).toContain(sectionId);
    expect(selectNodes(store.getState()).a.parentId).toBe(sectionId);
  });

  it('should leave a layer inside a frame where it is', () => {
    // mock
    store.dispatch(setSelection(['inFrame']));

    // action
    store.dispatch(wrapInSection());

    // result
    expect(selectNodes(store.getState()).inFrame.parentId).toBe('frame');
    expect(selectSelectedIds(store.getState())).toEqual(['inFrame']);
  });

  it('should wrap layers inside a section in a new section nested in that section', () => {
    // mock
    const outerSectionId = selectNodes(store.getState()).a.parentId as string;
    store.dispatch(setSelection(['a', 'b']));

    // action
    store.dispatch(wrapInSection());

    // result
    const [innerSectionId] = selectSelectedIds(store.getState());
    const nodes = selectNodes(store.getState());
    expect(nodes[innerSectionId]).toMatchObject({ childIds: ['a', 'b'], parentId: outerSectionId, type: NodeType.section, x: 75, y: 75 });
    expect((nodes[outerSectionId] as TSectionNode).childIds).toEqual([innerSectionId]);
  });

  it('should wrap a selected top-level section in a new section around it', () => {
    // mock
    const outerSectionId = selectActivePage(store.getState()).rootOrder.find(
      (id) => selectNodes(store.getState())[id].type === NodeType.section,
    );
    store.dispatch(setSelection([outerSectionId as string]));

    // action
    store.dispatch(wrapInSection());

    // result
    const [wrapperId] = selectSelectedIds(store.getState());
    expect(selectNodes(store.getState())[wrapperId]).toMatchObject({
      childIds: [outerSectionId],
      height: 190,
      parentId: null,
      type: NodeType.section,
      width: 240,
      x: 50,
      y: 50,
    });
  });
});
