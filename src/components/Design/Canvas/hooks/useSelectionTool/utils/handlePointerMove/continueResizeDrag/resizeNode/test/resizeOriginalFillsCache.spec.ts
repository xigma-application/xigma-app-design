// utils
import { clearResizeOriginalFills, getResizeOriginalFills } from '../resizeOriginalFillsCache';

describe('resizeOriginalFillsCache', () => {
  afterEach(() => {
    clearResizeOriginalFills('node-1');
  });

  it('should return the given fills on the first call for an id', () => {
    const fills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

    expect(getResizeOriginalFills('node-1', fills)).toBe(fills);
  });

  it('should keep returning the FIRST fills seen for an id, ignoring later (already-mutated) fills passed in', () => {
    const originalFills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const laterMutatedFills = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];

    getResizeOriginalFills('node-1', originalFills);

    expect(getResizeOriginalFills('node-1', laterMutatedFills)).toBe(originalFills);
  });

  it('should start fresh for an id again after it is cleared', () => {
    const firstDragFills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const secondDragFills = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

    getResizeOriginalFills('node-1', firstDragFills);
    clearResizeOriginalFills('node-1');

    expect(getResizeOriginalFills('node-1', secondDragFills)).toBe(secondDragFills);
  });

  it('should track each node id independently', () => {
    const fillsA = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const fillsB = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];

    expect(getResizeOriginalFills('node-a', fillsA)).toBe(fillsA);
    expect(getResizeOriginalFills('node-b', fillsB)).toBe(fillsB);

    clearResizeOriginalFills('node-a');
    clearResizeOriginalFills('node-b');
  });
});
