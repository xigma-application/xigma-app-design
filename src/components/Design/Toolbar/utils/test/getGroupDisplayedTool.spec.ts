// utils
import { getGroupDisplayedTool } from '../getGroupDisplayedTool';

// types
import { ToolName } from 'types/design/enums';

describe('getGroupDisplayedTool', () => {
  it('should return the last shape tool for the rectangle group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.rectangle, ToolName.star, ToolName.hand, ToolName.frame, ToolName.text, ToolName.pen)).toBe(
      ToolName.star,
    );
  });

  it('should return the last mouse tool for the default group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.default, ToolName.star, ToolName.hand, ToolName.frame, ToolName.text, ToolName.pen)).toBe(
      ToolName.hand,
    );
  });

  it('should return the last frame tool for the frame group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.frame, ToolName.star, ToolName.hand, ToolName.section, ToolName.text, ToolName.pen)).toBe(
      ToolName.section,
    );
  });

  it('should return the last text tool for the text group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.text, ToolName.star, ToolName.hand, ToolName.frame, ToolName.textOnPath, ToolName.pen)).toBe(
      ToolName.textOnPath,
    );
  });

  it('should return the last pen tool for the pen group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.pen, ToolName.star, ToolName.hand, ToolName.frame, ToolName.text, ToolName.pencil)).toBe(
      ToolName.pencil,
    );
  });

  it('should return the tool itself when it does not belong to a group', () => {
    // result
    expect(getGroupDisplayedTool(ToolName.comment, ToolName.star, ToolName.hand, ToolName.frame, ToolName.text, ToolName.pen)).toBe(
      ToolName.comment,
    );
  });
});
