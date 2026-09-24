// types
import { TRectangleNode } from 'types/design/types';

// utils
import { appendRectangleStroke } from '../appendRectangleStroke';
import { createRectBatch } from '../createRectBatch';

const createNode = (overrides: Record<string, unknown> = {}): TRectangleNode =>
  ({
    fills: [],
    height: 40,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    strokeAlign: 'inside',
    strokeWidth: 4,
    strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    type: 'rectangle',
    width: 60,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TRectangleNode;

describe('appendRectangleStroke', () => {
  it('should emit a ring strip per visible solid stroke paint, bottom paint first, at paint times node opacity', () => {
    // mock
    const batch = createRectBatch();
    const node = createNode({
      strokes: [
        { color: '#ff0000', opacity: 100, type: 'solid' },
        { color: '#00ff00', opacity: 100, type: 'solid', visible: false },
        { color: '#0000ff', opacity: 50, type: 'solid' },
      ],
    });

    // before
    appendRectangleStroke(batch, node, 0.5);

    // result
    const perStrip = batch.floatCount / 2;

    expect(perStrip).toBeGreaterThan(0);
    expect(Array.from(batch.data.subarray(2, 6))).toEqual([0, 0, 1, 0.25]);
    expect(Array.from(batch.data.subarray(perStrip + 2, perStrip + 6))).toEqual([1, 0, 0, 0.5]);
  });

  it('should keep the outline between the node edge and the inset edge for an inside stroke', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRectangleStroke(batch, createNode(), 1);

    // result
    const xs: number[] = [];

    for (let offset = 0; offset < batch.floatCount; offset += 6) {
      xs.push(batch.data[offset]);
    }

    expect(Math.min(...xs)).toBeCloseTo(0);
    expect(Math.max(...xs)).toBeCloseTo(60);
  });

  it.each([
    ['no stroke paints', { strokes: undefined }],
    ['an empty paint list', { strokes: [] }],
    ['no width', { strokeWidth: 0 }],
  ])('should emit nothing for %s', (_, overrides) => {
    // mock
    const batch = createRectBatch();

    // before
    appendRectangleStroke(batch, createNode(overrides), 1);

    // result
    expect(batch.floatCount).toBe(0);
  });

  it('should skip paints that are not solid', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRectangleStroke(batch, createNode({ strokes: [{ opacity: 100, type: 'image' }] }), 1);

    // result
    expect(batch.floatCount).toBe(0);
  });
});
