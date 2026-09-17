// utils
import { clearRotateOriginalFills, getRotateOriginalFills } from '../rotateOriginalFillsCache';

describe('rotateOriginalFillsCache', () => {
  afterEach(() => {
    clearRotateOriginalFills('node-1');
  });

  it('should return the given fills on the first call for an id', () => {
    const fills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

    expect(getRotateOriginalFills('node-1', fills)).toBe(fills);
  });

  it('should keep returning the FIRST fills seen for an id, ignoring later (already-mutated) fills passed in', () => {
    const originalFills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const laterMutatedFills = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];

    getRotateOriginalFills('node-1', originalFills);

    expect(getRotateOriginalFills('node-1', laterMutatedFills)).toBe(originalFills);
  });

  it('should start fresh for an id again after it is cleared', () => {
    const firstDragFills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const secondDragFills = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

    getRotateOriginalFills('node-1', firstDragFills);
    clearRotateOriginalFills('node-1');

    expect(getRotateOriginalFills('node-1', secondDragFills)).toBe(secondDragFills);
  });

  it('should track each node id independently', () => {
    const fillsA = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const fillsB = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];

    expect(getRotateOriginalFills('node-a', fillsA)).toBe(fillsA);
    expect(getRotateOriginalFills('node-b', fillsB)).toBe(fillsB);

    clearRotateOriginalFills('node-a');
    clearRotateOriginalFills('node-b');
  });
});
