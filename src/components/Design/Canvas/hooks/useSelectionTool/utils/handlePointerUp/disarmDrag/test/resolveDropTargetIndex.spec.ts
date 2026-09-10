// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

// utils
import { resolveDropTargetIndex } from '../resolveDropTargetIndex';

const page = { rootOrder: ['a', 'b', 'c'] } as TDesignPage;

const frame = (childIds: string[]): TSceneNode => ({ childIds, id: 'f1', type: NodeType.frame }) as unknown as TSceneNode;

const base = {
  autoLayoutDropTarget: null,
  matchingReorderPreview: null,
  page,
  targetFrame: null,
  targetParentId: null,
};

describe('resolveDropTargetIndex', () => {
  it('should use the matching reorder preview index first', () => {
    expect(resolveDropTargetIndex({ ...base, matchingReorderPreview: { activeIndex: 7 } as never })).toBe(7);
  });

  it('should use the auto-layout drop indicator index when it matches the target parent', () => {
    expect(
      resolveDropTargetIndex({
        ...base,
        autoLayoutDropTarget: { frameId: 'f1', index: 2 } as never,
        targetParentId: 'f1',
      }),
    ).toBe(2);
  });

  it('should append to the target container when there is no indicator', () => {
    expect(resolveDropTargetIndex({ ...base, targetFrame: frame(['x', 'y']) })).toBe(2);
  });

  it('should fall back to the page root length when dropping to the canvas', () => {
    expect(resolveDropTargetIndex(base)).toBe(3);
  });
});
