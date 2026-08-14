// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { getPathTextHandlePoint } from '../getPathTextHandlePoint';

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPathTextHandlePoint', () => {
  it('should return null when the node has no path binding', () => {
    // result
    expect(getPathTextHandlePoint(buildPathText({ pathId: null }))).toBeNull();
  });

  it('should place the handle at the rightmost edge when the offset is 0', () => {
    // before
    const point = getPathTextHandlePoint(buildPathText());

    // result
    expect(point?.x).toBeCloseTo(200);
    expect(point?.y).toBeCloseTo(100);
  });

  it('should place the handle a quarter turn around the curve for an offset of 0.25', () => {
    // before
    const point = getPathTextHandlePoint(buildPathText({ pathStartOffset: 0.25 }));

    // result
    expect(point?.x).toBeCloseTo(100, 1);
    expect(point?.y).toBeCloseTo(200, 1);
  });

  it('should default the start offset to 0 when the node has no pathStartOffset value', () => {
    // mock
    const node = buildPathText();

    delete node.pathStartOffset;

    // before
    const point = getPathTextHandlePoint(node);

    // result
    expect(point?.x).toBeCloseTo(200);
    expect(point?.y).toBeCloseTo(100);
  });

  it('should account for the node rotation', () => {
    // before
    const point = getPathTextHandlePoint(buildPathText({ rotation: 90 }));

    // result
    expect(point?.x).toBeCloseTo(100, 1);
    expect(point?.y).toBeCloseTo(200, 1);
  });

  it("should mirror the handle across the node's own center when flipped horizontally", () => {
    // before — the unflipped handle sits at the rightmost edge (200,100); flipped, it moves to the
    const point = getPathTextHandlePoint(buildPathText({ flipX: true }));

    // result
    expect(point?.x).toBeCloseTo(0);
    expect(point?.y).toBeCloseTo(100);
  });
});
