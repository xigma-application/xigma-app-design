// types
import { TRectangleNode } from 'types/design/types';

// utils
import { appendRoundedRectFan } from '../appendRoundedRectFan';
import { createRectBatch } from '../createRectBatch';

const createNode = (fills: unknown[], overrides: Record<string, unknown> = {}): TRectangleNode =>
  ({
    cornerRadius: 4,
    fills,
    height: 20,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 40,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TRectangleNode;

describe('appendRoundedRectFan', () => {
  it('should emit one fan per visible solid fill, bottom fill first, around the node center', () => {
    // mock
    const batch = createRectBatch();
    const node = createNode([
      { color: '#ff0000', opacity: 100, type: 'solid' },
      { color: '#00ff00', opacity: 50, type: 'solid', visible: false },
      { color: '#0000ff', opacity: 100, type: 'solid' },
    ]);

    // before
    appendRoundedRectFan(batch, node, 1);

    // result
    const perFan = batch.floatCount / 2;

    expect(perFan).toBeGreaterThan(0);
    expect(Array.from(batch.data.subarray(0, 6))).toEqual([20, 10, 0, 0, 1, 1]);
    expect(Array.from(batch.data.subarray(perFan, perFan + 6))).toEqual([20, 10, 1, 0, 0, 1]);
  });

  it('should multiply the paint opacity by the node opacity', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRoundedRectFan(batch, createNode([{ color: '#ffffff', opacity: 50, type: 'solid' }]), 0.5);

    // result
    expect(batch.data[5]).toBeCloseTo(0.25);
  });

  it('should rotate the outline around the center', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendRoundedRectFan(batch, createNode([{ color: '#ffffff', opacity: 100, type: 'solid' }], { rotation: 90 }), 1);

    // result — 40x20 turned by 90 degrees spans 20 wide and 40 tall
    const xs: number[] = [];
    const ys: number[] = [];

    for (let offset = 0; offset < batch.floatCount; offset += 6) {
      xs.push(batch.data[offset]);
      ys.push(batch.data[offset + 1]);
    }

    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(20, 3);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(40, 3);
  });
});
