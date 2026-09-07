// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutSyncChildren } from '../getAutoLayoutSyncChildren';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 30,
  x: 0,
  y: 0,
  ...overrides,
});

const frame = (overrides: Partial<TFrameNode>): TFrameNode => ({
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

describe('getAutoLayoutSyncChildren', () => {
  it('should build a size entry per child, carrying its sizing modes', () => {
    // mock
    const a = rect({ heightSizingMode: undefined, id: 'a', widthSizingMode: undefined });
    const layoutFrame = frame({ childIds: ['a'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { a, 'frame-1': layoutFrame });

    // result
    expect(result.children).toEqual([a]);
    expect(result.bounds).toEqual([{ height: 20, width: 30, x: 0, y: 0 }]);
    expect(result.sizes).toEqual([{ height: 20, heightSizingMode: undefined, id: 'a', width: 30, widthSizingMode: undefined }]);
  });

  it('should carry a child’s min/max width and height into its size entry', () => {
    // mock
    const a = rect({ id: 'a', maxHeight: 80, maxWidth: 90, minHeight: 10, minWidth: 20 });
    const layoutFrame = frame({ childIds: ['a'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { a, 'frame-1': layoutFrame });

    // result
    expect(result.sizes[0]).toMatchObject({ maxHeight: 80, maxWidth: 90, minHeight: 10, minWidth: 20 });
  });

  it('should skip a child id that no longer resolves to a node', () => {
    // mock
    const layoutFrame = frame({ childIds: ['gone'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { 'frame-1': layoutFrame });

    // result
    expect(result.children).toEqual([]);
    expect(result.bounds).toEqual([]);
    expect(result.sizes).toEqual([]);
  });

  it('should pack a rotated child by its rotated bounding box, relative to the frame', () => {
    // mock — a 10x10 square rotated 45deg has a rotated bbox side of 10*sqrt(2)
    const a = rect({ height: 10, rotation: 45, width: 10 });
    const layoutFrame = frame({ childIds: ['a'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { a, 'frame-1': layoutFrame });

    // result
    const expectedSide = 10 * Math.sqrt(2);

    expect(result.bounds[0].width).toBeCloseTo(expectedSide, 5);
    expect(result.bounds[0].height).toBeCloseTo(expectedSide, 5);
  });
});
