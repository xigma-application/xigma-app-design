// utils
import { getEditedPaintIndex } from '../getEditedPaintIndex';

describe('getEditedPaintIndex', () => {
  it('should return null when no image editor is active', () => {
    // result
    expect(getEditedPaintIndex(null, 'fills')).toBeNull();
  });

  it('should return the edited index for a fills editor and treat a missing property as fills', () => {
    // result
    expect(getEditedPaintIndex({ mode: 'crop', nodeId: 'n', paintIndex: 2 }, 'fills')).toBe(2);
    expect(getEditedPaintIndex({ mode: 'crop', nodeId: 'n', paintIndex: 2, property: 'fills' }, 'fills')).toBe(2);
  });

  it('should return the edited index only for the property being edited', () => {
    // mock
    const editor = { mode: 'crop' as const, nodeId: 'n', paintIndex: 1, property: 'strokes' as const };

    // result
    expect(getEditedPaintIndex(editor, 'strokes')).toBe(1);
    expect(getEditedPaintIndex(editor, 'fills')).toBeNull();
  });
});
