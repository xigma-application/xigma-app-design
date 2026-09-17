// types
import { TNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { clearDraggedNodesOriginalFills } from '../clearDraggedNodesOriginalFills';
import { getDragOriginalFills } from '../../../handlePointerMove/continueDrag/dragOriginalFillsCache';

describe('clearDraggedNodesOriginalFills', () => {
  it('should clear the cached original fills for every node id in the given origins', () => {
    // mock — seed the cache with each node's fills at the start of the drag
    const originalFillsA = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const originalFillsB = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];

    getDragOriginalFills('node-a', originalFillsA);
    getDragOriginalFills('node-b', originalFillsB);

    const nodeOrigins: Record<string, TNodeOrigin> = { 'node-a': { x: 0, y: 0 }, 'node-b': { x: 0, y: 0 } };

    // before
    clearDraggedNodesOriginalFills(nodeOrigins);

    // result — a fresh call now re-seeds the cache with the newly-passed fills instead of the stale ones
    const freshFillsA = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];
    const freshFillsB = [{ color: '#ffff00', opacity: 100, type: 'solid' as const }];

    expect(getDragOriginalFills('node-a', freshFillsA)).toBe(freshFillsA);
    expect(getDragOriginalFills('node-b', freshFillsB)).toBe(freshFillsB);
  });

  it('should do nothing when there are no node origins', () => {
    // mock
    const originalFills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

    getDragOriginalFills('node-c', originalFills);

    // before
    clearDraggedNodesOriginalFills({});

    // result — the untouched entry stays cached
    expect(getDragOriginalFills('node-c', [{ color: '#0000ff', opacity: 100, type: 'solid' as const }])).toBe(originalFills);
  });
});
