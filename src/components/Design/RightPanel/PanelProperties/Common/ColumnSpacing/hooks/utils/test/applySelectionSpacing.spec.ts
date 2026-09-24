// store
import { addNodes } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { applySelectionSpacing } from '../applySelectionSpacing';

const makeRectangle = (id: string, x: number, width: number): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y: 5,
});

describe('applySelectionSpacing', () => {
  it('should keep the first layer and place each next one the given gap after the previous one', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [makeRectangle('spaceA', 10, 20), makeRectangle('spaceB', 45, 30), makeRectangle('spaceC', 200, 10)],
        rootIds: ['spaceA', 'spaceB', 'spaceC'],
      }),
    );

    // action
    applySelectionSpacing(store.dispatch, [['spaceA'], ['spaceB'], ['spaceC']], 'horizontal', 15);

    // result
    const nodes = selectNodes(store.getState()) as Record<string, TRectangleNode>;

    expect([nodes.spaceA.x, nodes.spaceB.x, nodes.spaceC.x]).toEqual([10, 45, 90]);
    expect([nodes.spaceA.y, nodes.spaceB.y, nodes.spaceC.y]).toEqual([5, 5, 5]);
  });

  it('should move every layer of a column by the same amount', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [makeRectangle('gridA', 0, 20), makeRectangle('gridB', 0, 10), makeRectangle('gridC', 50, 20)],
        rootIds: ['gridA', 'gridB', 'gridC'],
      }),
    );

    // action
    applySelectionSpacing(store.dispatch, [['gridA', 'gridB'], ['gridC']], 'horizontal', 5);

    // result
    const nodes = selectNodes(store.getState()) as Record<string, TRectangleNode>;

    expect([nodes.gridA.x, nodes.gridB.x, nodes.gridC.x]).toEqual([0, 0, 25]);
  });

  it('should skip ids that no longer exist', () => {
    // action / result
    expect(() => applySelectionSpacing(store.dispatch, [['missing'], ['spaceA']], 'vertical', 0)).not.toThrow();
  });
});
