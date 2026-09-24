// types
import { TRectangleNode } from 'types/design/types';

// utils
import { appendRectangleQuads } from '../appendRectangleQuads';
import { createRectBatch } from '../createRectBatch';

const createNode = (fills: unknown[]): TRectangleNode =>
  ({
    fills,
    height: 10,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TRectangleNode;

describe('appendRectangleQuads', () => {
  it('should emit one quad per visible solid fill, bottom fill first', () => {
    // mock
    const batch = createRectBatch();
    const node = createNode([
      { color: '#ff0000', opacity: 100, type: 'solid' },
      { color: '#00ff00', opacity: 50, type: 'solid', visible: false },
      { color: '#0000ff', opacity: 100, type: 'solid' },
    ]);

    // before
    appendRectangleQuads(batch, node, 1);

    // result
    expect(batch.floatCount).toBe(72);
    expect(Array.from(batch.data.subarray(2, 5))).toEqual([0, 0, 1]);
    expect(Array.from(batch.data.subarray(38, 41))).toEqual([1, 0, 0]);
  });

  it('should multiply the paint opacity by the node opacity', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRectangleQuads(batch, createNode([{ color: '#ffffff', opacity: 50, type: 'solid' }]), 0.5);

    // result
    expect(batch.data[5]).toBeCloseTo(0.25);
  });

  it('should skip a fill that is not solid', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRectangleQuads(batch, createNode([{ opacity: 100, type: 'image' }]), 1);

    // result
    expect(batch.floatCount).toBe(0);
  });
});
