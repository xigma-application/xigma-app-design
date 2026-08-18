import { getCursorClassName } from '../getCursorClassName';

// types
import { ToolName } from 'types/design/enums';

describe('getCursorClassName', () => {
  it('should return "comment" for the Comment tool', () => {
    // before
    const result = getCursorClassName(ToolName.comment);

    // result
    expect(result).toBe('comment');
  });

  it('should return "drawing" for a tool in DRAWING_TOOLS', () => {
    // before
    const result = getCursorClassName(ToolName.frame);

    // result
    expect(result).toBe('drawing');
  });

  it('should return null for a tool that is neither Comment nor a drawing tool', () => {
    // before
    const result = getCursorClassName(ToolName.default);

    // result
    expect(result).toBeNull();
  });
});
