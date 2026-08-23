// utils
import { isMoreToolName } from '../isMoreToolName';

// types
import { ToolName } from 'types/design/enums';

describe('isMoreToolName', () => {
  it('should return true for Shape builder', () => {
    // result
    expect(isMoreToolName(ToolName.shapeBuilder)).toBe(true);
  });

  it('should return true for Variable width', () => {
    // result
    expect(isMoreToolName(ToolName.variableWidth)).toBe(true);
  });

  it('should return false for any other tool', () => {
    // result
    expect(isMoreToolName(ToolName.move)).toBe(false);
  });
});
