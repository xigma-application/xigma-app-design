// types
import { TEllipseNode } from 'types/design/types';

// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// utils
import { appendEllipseFan } from '../appendEllipseFan';
import { createRectBatch } from '../createRectBatch';

const createNode = (overrides: Record<string, unknown> = {}): TEllipseNode =>
  ({
    fill: '#ff0000',
    height: 20,
    id: 'e',
    name: 'e',
    parentId: null,
    rotation: 0,
    type: 'ellipse',
    width: 40,
    x: 100,
    y: 200,
    ...overrides,
  }) as unknown as TEllipseNode;

describe('appendEllipseFan', () => {
  it('should emit a fan of the ellipse outline around its center in the fill color at the node opacity', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendEllipseFan(batch, createNode(), 0.5);

    // result
    expect(batch.floatCount).toBe(ELLIPSE_SEGMENTS * 18);
    expect(Array.from(batch.data.subarray(0, 6))).toEqual([120, 210, 1, 0, 0, 0.5]);
  });

  it('should keep every vertex on the ellipse after rotating it around its center', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendEllipseFan(batch, createNode({ rotation: 90 }), 1);

    // result — a 40x20 ellipse turned by 90 degrees spans 20 wide and 40 tall around (120, 210)
    const xs: number[] = [];
    const ys: number[] = [];

    for (let offset = 0; offset < batch.floatCount; offset += 6) {
      xs.push(batch.data[offset]);
      ys.push(batch.data[offset + 1]);
    }

    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(20, 3);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(40, 3);
  });

  it('should emit nothing without a fill', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendEllipseFan(batch, createNode({ fill: '' }), 1);

    // result
    expect(batch.floatCount).toBe(0);
  });
});
