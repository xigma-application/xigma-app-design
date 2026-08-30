// others
import { PATH_NAME, PATH_START_OFFSET_TOP } from '../../../../../constants';

// store
import { selectActivePage, selectEditingTextBox } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, PathType } from 'types/design/enums';

// utils
import { drawEllipsePath } from '../drawEllipsePath';

const RECT = { height: 100, width: 100, x: 7000, y: 0 };

describe('drawEllipsePath', () => {
  it('should add a named ellipse path node at the given rect', () => {
    // before
    drawEllipsePath(RECT, store.dispatch);

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const pathNodeId = rootOrder[rootOrder.length - 1];

    expect(nodes[pathNodeId]).toMatchObject({ ...RECT, name: PATH_NAME, pathType: PathType.ellipse, type: NodeType.path });
  });

  it('should select the new path and start text-editing bound to it, offset at the top of the ellipse', () => {
    // before
    drawEllipsePath({ ...RECT, x: 7200 }, store.dispatch);

    // result
    const { rootOrder, selectedIds } = selectActivePage(store.getState());
    const pathNodeId = rootOrder[rootOrder.length - 1];

    expect(selectedIds).toEqual([pathNodeId]);
    expect(selectEditingTextBox(store.getState())).toMatchObject({
      pathFlip: false,
      pathId: pathNodeId,
      pathStartOffset: PATH_START_OFFSET_TOP,
      rotation: 0,
    });
  });
});
