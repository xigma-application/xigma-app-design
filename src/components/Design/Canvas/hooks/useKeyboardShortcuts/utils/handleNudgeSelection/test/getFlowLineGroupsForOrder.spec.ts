// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlowLineGroupsForOrder } from '../getFlowLineGroupsForOrder';

const frame = (layoutMode: LayoutMode.horizontal | LayoutMode.vertical, layoutWrap: boolean, width: number, height: number): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    height,
    id: 'frame',
    layoutMode,
    layoutWrap,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width,
    x: 0,
    y: 0,
  }) as unknown as TFrameNode;

const size = (id: string, width: number, height: number): TAutoLayoutChildSize =>
  ({ height, id, width }) as unknown as TAutoLayoutChildSize;

const sizesById = (...entries: TAutoLayoutChildSize[]): Map<string, TAutoLayoutChildSize> =>
  new Map(entries.map((entry) => [entry.id, entry]));

describe('getFlowLineGroupsForOrder', () => {
  it('should return a single line for the given order when wrap is off, regardless of overflow', () => {
    const testFrame = frame(LayoutMode.horizontal, false, 200, 100);
    const sizes = sizesById(size('a', 100, 20), size('b', 100, 20), size('c', 100, 20));

    expect(getFlowLineGroupsForOrder(testFrame, sizes, ['a', 'b', 'c'])).toEqual([['a', 'b', 'c']]);
  });

  it('should split into multiple lines by width for a horizontal wrapped frame', () => {
    const testFrame = frame(LayoutMode.horizontal, true, 220, 100);
    const sizes = sizesById(size('a', 100, 20), size('b', 100, 20), size('c', 100, 20));

    expect(getFlowLineGroupsForOrder(testFrame, sizes, ['a', 'b', 'c'])).toEqual([['a', 'b'], ['c']]);
  });

  it('should split into multiple lines by height for a vertical wrapped frame', () => {
    const testFrame = frame(LayoutMode.vertical, true, 100, 220);
    const sizes = sizesById(size('a', 20, 100), size('b', 20, 100), size('c', 20, 100));

    expect(getFlowLineGroupsForOrder(testFrame, sizes, ['a', 'b', 'c'])).toEqual([['a', 'b'], ['c']]);
  });

  it('should compute lines for an arbitrary given order, not just the natural insertion order', () => {
    const testFrame = frame(LayoutMode.horizontal, true, 220, 100);
    const sizes = sizesById(size('a', 100, 20), size('b', 100, 20), size('c', 100, 20));

    // 'b' and 'c' together (200) fit on one line; 'a' alone starts the next
    expect(getFlowLineGroupsForOrder(testFrame, sizes, ['b', 'c', 'a'])).toEqual([['b', 'c'], ['a']]);
  });

  it('should silently skip an id that has no matching size entry', () => {
    const testFrame = frame(LayoutMode.horizontal, true, 220, 100);
    const sizes = sizesById(size('a', 100, 20), size('c', 100, 20));

    expect(getFlowLineGroupsForOrder(testFrame, sizes, ['a', 'missing', 'c'])).toEqual([['a', 'c']]);
  });
});
