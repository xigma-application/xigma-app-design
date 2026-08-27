// others
import { ERASER_MAX_DIAMETER_PX, ERASER_MIN_DIAMETER_PX } from 'constant/canvas';

// types
import { ToolName } from 'types/design/enums';

// utils
import { adjustEraserDiameter } from '../adjustEraserDiameter';

const key = (code: string): KeyboardEvent => new KeyboardEvent('keydown', { code });

describe('adjustEraserDiameter', () => {
  it('should grow the diameter on "]" and shrink it on "["', () => {
    // mock
    const ref = { current: 10 };

    // action
    adjustEraserDiameter(key('BracketRight'), ToolName.erase, ref);
    adjustEraserDiameter(key('BracketRight'), ToolName.erase, ref);

    // result
    expect(ref.current).toBe(12);

    // action
    adjustEraserDiameter(key('BracketLeft'), ToolName.erase, ref);

    // result
    expect(ref.current).toBe(11);
  });

  it('should clamp to the min and max bounds', () => {
    // mock
    const ref = { current: ERASER_MIN_DIAMETER_PX };

    // action
    adjustEraserDiameter(key('BracketLeft'), ToolName.erase, ref);

    // result
    expect(ref.current).toBe(ERASER_MIN_DIAMETER_PX);

    // mock
    ref.current = ERASER_MAX_DIAMETER_PX;

    // action
    adjustEraserDiameter(key('BracketRight'), ToolName.erase, ref);

    // result
    expect(ref.current).toBe(ERASER_MAX_DIAMETER_PX);
  });

  it('should ignore the brackets for any other tool, and ignore unrelated keys', () => {
    // mock
    const ref = { current: 10 };

    // action
    adjustEraserDiameter(key('BracketRight'), ToolName.cut, ref);
    adjustEraserDiameter(key('KeyA'), ToolName.erase, ref);

    // result
    expect(ref.current).toBe(10);
  });
});
