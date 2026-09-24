// types
import { TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { createRectBatch } from 'utils/canvas/drawRectBatch/createRectBatch';
import { pushSwapHandleDots } from '../pushSwapHandleDots';

const FLOATS_PER_DOT = 2 * 12 * 3 * 6;

const node = (id: string, x: number, y: number): TSmartSelectionNode => ({ bounds: { height: 10, width: 10, x, y }, id });
const rowLayout = (...nodes: TSmartSelectionNode[]): TSmartSelectionLayout => ({ gaps: [], nodes, type: 'row' });

describe('pushSwapHandleDots', () => {
  it('should push an outline and a core circle per node', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushSwapHandleDots(batch, rowLayout(node('a', 0, 0), node('b', 100, 0)), 1);

    // result
    expect(batch.floatCount).toBe(2 * FLOATS_PER_DOT);
  });

  it('should push a single dot for nodes whose centers land in the same screen cell', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushSwapHandleDots(batch, rowLayout(node('a', 0, 0), node('b', 0.1, 0.1)), 1);

    // result
    expect(batch.floatCount).toBe(FLOATS_PER_DOT);
  });

  it('should keep the dot size constant on screen by dividing the radii by the zoom', () => {
    // mock
    const near = createRectBatch();
    const far = createRectBatch();

    // before
    pushSwapHandleDots(near, rowLayout(node('a', 0, 0)), 1);
    pushSwapHandleDots(far, rowLayout(node('a', 0, 0)), 0.5);

    // result
    const reach = (batch: ReturnType<typeof createRectBatch>): number => {
      const xs: number[] = [];

      for (let offset = 0; offset < batch.floatCount; offset += 6) {
        xs.push(batch.data[offset]);
      }

      return Math.max(...xs) - Math.min(...xs);
    };

    expect(reach(far)).toBeCloseTo(reach(near) * 2, 3);
  });

  it('should push nothing for a layout without nodes', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushSwapHandleDots(batch, rowLayout(), 1);

    // result
    expect(batch.floatCount).toBe(0);
  });
});
