// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { commitNodeDimension } from '../commitNodeDimension';

const commitMock = vi.fn();

vi.mock('../commitDimensionChanges', () => ({ commitDimensionChanges: (...args: unknown[]): unknown => commitMock(...args) }));

describe('commitNodeDimension', () => {
  beforeEach(() => {
    commitMock.mockClear();
  });

  it('should commit the new width, keeping the height of an unlocked node', () => {
    // mock
    const dispatch = vi.fn();
    const node = { height: 50, id: 'n', width: 100 } as TBoxSceneNode;

    // before
    commitNodeDimension(dispatch, node, 'width', 200);

    // result
    expect(commitMock).toHaveBeenCalledWith(dispatch, 'n', node, 100, 50, { height: 50, width: 200 });
  });

  it('should scale the other axis of an aspect-locked node', () => {
    // mock
    const node = { height: 50, id: 'n', lockedAspectRatio: true, width: 100 } as TBoxSceneNode;

    // before
    commitNodeDimension(vi.fn(), node, 'width', 200);

    // result
    expect(commitMock.mock.calls[0][5]).toEqual({ height: 100, width: 200 });
  });
});
