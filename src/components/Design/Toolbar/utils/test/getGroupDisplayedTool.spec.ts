// utils
import { getGroupDisplayedTool } from '../getGroupDisplayedTool';

// types
import { ToolName } from 'types/design/enums';

describe('getGroupDisplayedTool', () => {
  it('should return the last shape tool for the rectangle group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.rectangle, ToolName.star, ToolName.hand)).toBe(ToolName.star);
  });

  it('should return the last mouse tool for the default group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.default, ToolName.star, ToolName.hand)).toBe(ToolName.hand);
  });

  it('should return the tool itself when it does not belong to a group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.comment, ToolName.star, ToolName.hand)).toBe(ToolName.comment);
  });
});
