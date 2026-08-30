// types
import { ToolName } from 'types/design/enums';

// utils
import { shouldForwardAltKeyChange } from '../shouldForwardAltKeyChange';

const POSITION = { x: 10, y: 20 };

describe('shouldForwardAltKeyChange', () => {
  it('should forward when Alt changes over a tool that has an Alt-hover behaviour', () => {
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.default, POSITION)).toBe(true);
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.move, POSITION)).toBe(true);
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.scale, POSITION)).toBe(true);
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.shapeBuilder, POSITION)).toBe(true);
  });

  it('should not forward a non-Alt key', () => {
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), ToolName.default, POSITION)).toBe(false);
  });

  it('should not forward for a tool with no Alt-hover behaviour', () => {
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.pen, POSITION)).toBe(false);
  });

  it('should not forward when there is no last pointer position yet', () => {
    expect(shouldForwardAltKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), ToolName.default, null)).toBe(false);
  });
});
