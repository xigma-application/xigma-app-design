// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TRectangleNode, TTextNode } from 'types/design/types';

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

const line = (overrides: Partial<TLineNode>): TLineNode => ({
  id: 'a',
  name: 'Line',
  parentId: 'frame-1',
  stroke: '#000',
  type: NodeType.line,
  x1: 0,
  x2: 30,
  y1: 0,
  y2: 0,
  ...overrides,
});

const text = (overrides: Partial<TTextNode>): TTextNode => ({
  content: 'Hello',
  fill: '#000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 16,
  height: 20,
  id: 'a',
  name: 'Text',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.text,
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

  it('should carry a text child’s fontSize into its size entry, and leave it undefined for non-text children', () => {
    // mock
    const a = text({ fontSize: 24, id: 'a' });
    const b = rect({ id: 'b' });
    const layoutFrame = frame({ childIds: ['a', 'b'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { a, b, 'frame-1': layoutFrame });

    // result
    expect(result.sizes[0].fontSize).toBe(24);
    expect(result.sizes[1].fontSize).toBeUndefined();
  });

  it('should leave the sizing-mode and min/max fields undefined for a non-box child, like a line', () => {
    // mock
    const a = line({ id: 'a' });
    const layoutFrame = frame({ childIds: ['a'] });

    // before
    const result = getAutoLayoutSyncChildren(layoutFrame, { a, 'frame-1': layoutFrame });

    // result
    expect(result.sizes[0]).toMatchObject({
      heightSizingMode: undefined,
      maxHeight: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      minWidth: undefined,
      widthSizingMode: undefined,
    });
  });
});
