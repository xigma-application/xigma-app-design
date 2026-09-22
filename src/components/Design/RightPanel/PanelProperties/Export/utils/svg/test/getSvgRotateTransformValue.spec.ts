// utils
import { getSvgRotateTransformValue } from '../getSvgRotateTransformValue';

describe('getSvgRotateTransformValue', () => {
  it('should return an empty string for a zero rotation', () => {
    expect(getSvgRotateTransformValue(0, { height: 10, width: 10, x: 0, y: 0 }, { height: 100, width: 100, x: 0, y: 0 })).toBe('');
  });

  it('should build a rotate() value around the rect center, translated into page-local coordinates', () => {
    const rect = { height: 20, width: 20, x: 10, y: 10 };
    const bounds = { height: 100, width: 100, x: 5, y: 5 };

    expect(getSvgRotateTransformValue(45, rect, bounds)).toBe('rotate(45 15 15)');
  });
});
