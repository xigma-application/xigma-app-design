// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { ejectSectionChildren } from '../ejectSectionChildren';

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

describe('ejectSectionChildren', () => {
  it('should drop the children that fit before but not after into the parent, right above the section', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          makeSection('shrunk', 0, 100, ['kept', 'dropped']),
          makeRectangle('kept', 10, 'shrunk'),
          makeRectangle('dropped', 120, 'shrunk'),
          makeRectangle('after', 2000),
        ],
        rootIds: ['shrunk', 'after'],
      }),
    );

    // action
    ejectSectionChildren(store.dispatch, 'shrunk', { height: 100, width: 300, x: 0, y: 0 });

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    expect((nodes.shrunk as TSectionNode).childIds).toEqual(['kept']);
    expect(rootOrder.indexOf('dropped')).toBe(rootOrder.indexOf('shrunk') + 1);
  });

  it('should do nothing for a node that is not a section or when every child still fits', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [makeRectangle('plainNode', 3000), makeSection('roomy', 4000, 300, ['fits']), makeRectangle('fits', 4010, 'roomy')],
        rootIds: ['plainNode', 'roomy'],
      }),
    );
    const spy = vi.spyOn(store, 'dispatch');

    // action
    ejectSectionChildren(store.dispatch, 'plainNode', { height: 100, width: 100, x: 3000, y: 0 });
    ejectSectionChildren(store.dispatch, 'roomy', { height: 100, width: 300, x: 4000, y: 0 });

    // result
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
