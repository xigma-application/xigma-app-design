// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../types';

// utils
import { getNewNodeTargetIndex } from '../getNewNodeTargetIndex';

const frame = {
  childIds: ['a', 'b'],
  clipContent: true,
  fills: [],
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const buildPage = (): TDesignPage =>
  ({
    id: 'page-1',
    nodes: { 'frame-1': frame },
    rootOrder: ['frame-1', 'other'],
  }) as unknown as TDesignPage;

describe('getNewNodeTargetIndex', () => {
  it('should return the root order length when parentId is null', () => {
    expect(getNewNodeTargetIndex(buildPage(), null)).toBe(2);
  });

  it("should return the parent frame's childIds length when parentId points to a container", () => {
    expect(getNewNodeTargetIndex(buildPage(), 'frame-1')).toBe(2);
  });

  it('should fall back to the root order length when parentId points to a missing node', () => {
    expect(getNewNodeTargetIndex(buildPage(), 'missing')).toBe(2);
  });
});
