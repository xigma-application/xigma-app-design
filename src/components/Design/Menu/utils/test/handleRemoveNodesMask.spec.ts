// store
import { addNodes } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TMaskNode, TRectangleNode } from 'types/design/types';

// utils
import { handleRemoveNodesMask } from '../handleRemoveNodesMask';

const makeRectangle = (id: string, parentId: string): TRectangleNode => ({
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

const makeMask = (id: string, childIds: string[]): TMaskNode => ({
  childIds,
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 10,
  x: 0,
  y: 0,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeMask('removeMaskA', ['removeMaskAContent', 'removeMaskAShape']),
        makeRectangle('removeMaskAContent', 'removeMaskA'),
        makeRectangle('removeMaskAShape', 'removeMaskA'),
        makeMask('removeMaskB', ['removeMaskBContent', 'removeMaskBShape']),
        makeRectangle('removeMaskBContent', 'removeMaskB'),
        makeRectangle('removeMaskBShape', 'removeMaskB'),
      ],
      rootIds: ['removeMaskA', 'removeMaskB'],
    }),
  );
});

describe('handleRemoveNodesMask', () => {
  it('should remove the mask from every selected mask shape and mask group in one undo step', () => {
    // mock
    const before = selectNodes(store.getState());

    // action
    handleRemoveNodesMask(store.dispatch, [before.removeMaskAShape, before.removeMaskB]);

    // result
    const after = selectNodes(store.getState());

    expect(after.removeMaskA.type).toBe(NodeType.group);
    expect(after.removeMaskB).toBeUndefined();
    expect(after.removeMaskBContent.parentId).toBeNull();
    expect(after.removeMaskBShape.parentId).toBeNull();

    // action
    store.dispatch(undo());

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });
});
