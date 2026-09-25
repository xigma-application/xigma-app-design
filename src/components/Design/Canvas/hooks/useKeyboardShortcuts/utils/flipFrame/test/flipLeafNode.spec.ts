// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { flipLeafNode } from '../flipLeafNode';

const resizeNodeMock = vi.fn();
const clearResizeOriginalFillsMock = vi.fn();

vi.mock('../../../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache', () => ({
  clearResizeOriginalFills: (...args: unknown[]): unknown => clearResizeOriginalFillsMock(...args),
}));
vi.mock('../../../../useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin', () => ({
  getResizeNodeOrigin: (): string => 'origin',
}));
vi.mock('../../../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode', () => ({
  resizeNode: (...args: unknown[]): unknown => resizeNodeMock(...args),
}));

const leaf = (type: NodeType, rotation: number): TSceneNode => ({ id: 'leaf', rotation, type }) as TSceneNode;

describe('flipLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mirror the leaf through a negative scale around the anchor and mirror its rotation', () => {
    // mock
    const dispatch = vi.fn();

    // before
    flipLeafNode(dispatch, leaf(NodeType.rectangle, 390), { x: 5, y: 6 }, -1, 1, true);

    // result
    expect(resizeNodeMock).toHaveBeenCalledWith('leaf', 'origin', dispatch, { x: 5, y: 6 }, -1, 1, true, null);
    expect(clearResizeOriginalFillsMock).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { rotation: 330 }, id: 'leaf' }));
  });

  it('should leave the rotation of an unrotated leaf and of a line alone', () => {
    // mock
    const dispatch = vi.fn();

    // before
    flipLeafNode(dispatch, leaf(NodeType.rectangle, 0), { x: 0, y: 0 }, 1, -1, false);
    flipLeafNode(dispatch, leaf(NodeType.line, 45), { x: 0, y: 0 }, 1, -1, false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
