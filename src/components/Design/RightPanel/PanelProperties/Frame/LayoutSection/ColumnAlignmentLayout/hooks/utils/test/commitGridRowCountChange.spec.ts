// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { commitGridRowCountChange } from '../commitGridRowCountChange';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('commitGridRowCountChange', () => {
  it('should dispatch updateNode with the frame id and the new row count', () => {
    const dispatch = vi.fn();

    commitGridRowCountChange(dispatch, frame(), 3);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowCount: 3 }, id: 'frame-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no frame node is selected', () => {
    const dispatch = vi.fn();

    commitGridRowCountChange(dispatch, undefined, 3);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
