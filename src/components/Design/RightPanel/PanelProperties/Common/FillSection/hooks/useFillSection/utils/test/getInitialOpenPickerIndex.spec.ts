// utils
import { getInitialOpenPickerIndex } from '../getInitialOpenPickerIndex';

describe('getInitialOpenPickerIndex', () => {
  it('should resume the focused fill row when the focus targets this node', () => {
    expect(getInitialOpenPickerIndex('fills', { nodeId: 'node-1', paintIndex: 2 }, 'node-1')).toBe(2);
  });

  it('should return null when the focus targets another node', () => {
    expect(getInitialOpenPickerIndex('fills', { nodeId: 'node-2', paintIndex: 2 }, 'node-1')).toBeNull();
  });

  it('should return null when nothing is focused', () => {
    expect(getInitialOpenPickerIndex('fills', null, 'node-1')).toBeNull();
  });

  it('should resume a strokes focus only for the strokes section', () => {
    expect(getInitialOpenPickerIndex('strokes', { nodeId: 'node-1', paintIndex: 2, property: 'strokes' }, 'node-1')).toBe(2);
    expect(getInitialOpenPickerIndex('fills', { nodeId: 'node-1', paintIndex: 2, property: 'strokes' }, 'node-1')).toBeNull();
  });

  it('should not resume a fills focus for the strokes section', () => {
    expect(getInitialOpenPickerIndex('strokes', { nodeId: 'node-1', paintIndex: 2 }, 'node-1')).toBeNull();
  });
});
