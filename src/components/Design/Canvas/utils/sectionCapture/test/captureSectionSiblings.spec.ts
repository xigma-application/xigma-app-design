// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { captureSectionSiblings } from '../captureSectionSiblings';

const makeRectangle = (id: string, x: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y: 0,
});

const makeSection = (id: string, x: number, width: number, childIds: string[] = []): TSectionNode => ({
  childIds,
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width,
  x,
  y: 0,
});

describe('captureSectionSiblings', () => {
  it('should move the siblings that fit whole into the section after its current children', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          makeRectangle('siblingIn', 10),
          makeRectangle('siblingOut', 180),
          makeSection('collector', 0, 200, ['existing']),
          makeRectangle('existing', 60, 'collector'),
        ],
        rootIds: ['siblingIn', 'siblingOut', 'collector'],
      }),
    );

    // action
    captureSectionSiblings(store.dispatch, 'collector');

    // result
    const { nodes } = selectActivePage(store.getState());
    expect((nodes.collector as TSectionNode).childIds).toEqual(['existing', 'siblingIn']);
    expect(nodes.siblingOut.parentId).toBeNull();
  });

  it('should do nothing for a node that is not a section or a section with nothing to collect', () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [makeRectangle('notSection', 1000), makeSection('empty', 5000, 10)], rootIds: ['notSection', 'empty'] }),
    );
    const spy = vi.spyOn(store, 'dispatch');

    // action
    captureSectionSiblings(store.dispatch, 'notSection');
    captureSectionSiblings(store.dispatch, 'empty');

    // result
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
