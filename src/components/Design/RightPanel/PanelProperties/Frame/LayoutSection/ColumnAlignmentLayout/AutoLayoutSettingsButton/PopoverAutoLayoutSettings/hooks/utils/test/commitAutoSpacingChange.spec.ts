// store
import { updateNode } from 'store/design/slice';

// types
import { AutoSpacing, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { commitAutoSpacingChange } from '../commitAutoSpacingChange';

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

describe('commitAutoSpacingChange', () => {
  it('should dispatch an updateNode action with the frame id and the selected value', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitAutoSpacingChange(dispatch, frame(), AutoSpacing.evenly);

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { autoSpacing: AutoSpacing.evenly }, id: 'frame-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no frame node is selected', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitAutoSpacingChange(dispatch, undefined, AutoSpacing.evenly);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
