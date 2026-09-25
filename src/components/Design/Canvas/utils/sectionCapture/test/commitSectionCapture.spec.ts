// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { commitSectionCapture } from '../commitSectionCapture';

const makeRectangle = (id: string, x: number, y: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y,
});

const makeSection = (
  id: string,
  box: { height: number; width: number; x: number; y: number },
  childIds: string[] = [],
  parentId: string | null = null,
): TSectionNode => ({
  ...box,
  childIds,
  fill: '#444444',
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.section,
});

const readNodes = (): ReturnType<typeof selectActivePage>['nodes'] => selectActivePage(store.getState()).nodes;

describe('commitSectionCapture', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should move the siblings that fit whole into the section and clear the outlines', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    canvasRefs.transform.sectionCaptureIdsRef.current = ['capA'];
    store.dispatch(
      addNodes({
        nodes: [
          makeRectangle('capA', 10, 10),
          makeRectangle('capOut', 500, 10),
          makeSection('capSection', { height: 200, width: 200, x: 0, y: 0 }),
        ],
        rootIds: ['capA', 'capOut', 'capSection'],
      }),
    );

    // action
    commitSectionCapture(store.dispatch, canvasRefs, 'capSection', null);

    // result
    expect((readNodes().capSection as TSectionNode).childIds).toEqual(['capA']);
    expect(readNodes().capOut.parentId).toBeNull();
    expect(canvasRefs.transform.sectionCaptureIdsRef.current).toEqual([]);
  });

  it('should drop the children that no longer fit into the section parent right above the section', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    store.dispatch(
      addNodes({
        nodes: [
          makeSection('ejectSection', { height: 100, width: 100, x: 1000, y: 0 }, ['ejectStays', 'ejectLeaves']),
          makeRectangle('ejectStays', 1010, 10, 'ejectSection'),
          makeRectangle('ejectLeaves', 1120, 10, 'ejectSection'),
        ],
        rootIds: ['ejectSection'],
      }),
    );

    // action
    commitSectionCapture(store.dispatch, canvasRefs, 'ejectSection', { height: 300, width: 300, x: 1000, y: 0 });

    // result
    const { rootOrder } = selectActivePage(store.getState());
    expect((readNodes().ejectSection as TSectionNode).childIds).toEqual(['ejectStays']);
    expect(readNodes().ejectLeaves.parentId).toBeNull();
    expect(rootOrder.indexOf('ejectLeaves')).toBe(rootOrder.indexOf('ejectSection') + 1);
  });

  it('should do nothing for a node that is not a section', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    store.dispatch(
      addNodes({ nodes: [makeRectangle('plain', 2000, 0), makeRectangle('plainInside', 2000, 0)], rootIds: ['plain', 'plainInside'] }),
    );

    // action
    commitSectionCapture(store.dispatch, canvasRefs, 'plain', { height: 50, width: 50, x: 2000, y: 0 });

    // result
    expect(readNodes().plainInside.parentId).toBeNull();
  });
});
