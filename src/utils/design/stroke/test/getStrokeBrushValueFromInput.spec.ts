// utils
import { getStrokeBrushValueFromInput } from '../getStrokeBrushValueFromInput';

describe('getStrokeBrushValueFromInput', () => {
  it('should read percent and degree text and clamp it', () => {
    expect(getStrokeBrushValueFromInput('500%', 1)).toBe(500);
    expect(getStrokeBrushValueFromInput('-200°', -180, 180)).toBe(-180);
    expect(getStrokeBrushValueFromInput('0', 1)).toBe(1);
  });

  it('should reject text that is not a number', () => {
    expect(getStrokeBrushValueFromInput('', 0)).toBeUndefined();
    expect(getStrokeBrushValueFromInput('x', 0)).toBeUndefined();
  });
});
