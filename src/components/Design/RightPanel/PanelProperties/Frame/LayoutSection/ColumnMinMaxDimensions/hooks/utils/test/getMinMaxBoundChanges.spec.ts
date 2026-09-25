// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getMinMaxBoundChanges } from '../getMinMaxBoundChanges';

const node = (extra: Partial<TBoxSceneNode> = {}): TBoxSceneNode => ({ height: 50, width: 100, ...extra }) as TBoxSceneNode;

describe('getMinMaxBoundChanges', () => {
  it('should set a min width, growing the width and pushing up a smaller max', () => {
    // result
    expect(getMinMaxBoundChanges(node({ maxWidth: 110 }), 'minWidth', 120)).toEqual({ maxWidth: 120, minWidth: 120, width: 120 });
    expect(getMinMaxBoundChanges(node({ maxWidth: 200 }), 'minWidth', 20)).toEqual({ maxWidth: 200, minWidth: 20, width: 100 });
    expect(getMinMaxBoundChanges(node(), 'minWidth', 20)).toEqual({ maxWidth: undefined, minWidth: 20, width: 100 });
  });

  it('should set a max height, shrinking the height and pulling down a larger min', () => {
    // result
    expect(getMinMaxBoundChanges(node({ minHeight: 40 }), 'maxHeight', 30)).toEqual({ height: 30, maxHeight: 30, minHeight: 30 });
    expect(getMinMaxBoundChanges(node({ minHeight: 10 }), 'maxHeight', 30)).toEqual({ height: 30, maxHeight: 30, minHeight: 10 });
    expect(getMinMaxBoundChanges(node(), 'maxHeight', 80)).toEqual({ height: 50, maxHeight: 80, minHeight: undefined });
  });

  it('should clear a bound set to zero or less', () => {
    // result
    expect(getMinMaxBoundChanges(node({ maxHeight: 60, minHeight: 20 }), 'minHeight', 0)).toEqual({
      height: 50,
      maxHeight: 60,
      minHeight: undefined,
    });
    expect(getMinMaxBoundChanges(node({ maxWidth: 60, minWidth: 20 }), 'maxWidth', -1)).toEqual({
      maxWidth: undefined,
      minWidth: 20,
      width: 100,
    });
  });
});
