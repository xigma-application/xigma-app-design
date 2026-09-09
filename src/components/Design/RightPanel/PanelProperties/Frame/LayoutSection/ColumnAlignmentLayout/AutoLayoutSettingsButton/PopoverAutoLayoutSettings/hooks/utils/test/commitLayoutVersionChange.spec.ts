// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutVersion, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { commitLayoutVersionChange } from '../commitLayoutVersionChange';

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

describe('commitLayoutVersionChange', () => {
  it('should dispatch an updateNode action with the frame id and the selected value', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitLayoutVersionChange(dispatch, frame(), LayoutVersion.legacy);

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { layoutVersion: LayoutVersion.legacy }, id: 'frame-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no frame node is selected', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitLayoutVersionChange(dispatch, undefined, LayoutVersion.legacy);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
