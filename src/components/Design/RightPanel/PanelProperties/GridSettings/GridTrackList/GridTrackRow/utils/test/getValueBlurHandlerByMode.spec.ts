// utils
import { getValueBlurHandlerByMode } from '../getValueBlurHandlerByMode';

// types
import { SizingMode } from 'types/design/enums';

describe('getValueBlurHandlerByMode', () => {
  it('should map each sizing mode to its own blur handler', () => {
    const handleFillBlur = vi.fn();
    const handleBlur = vi.fn();
    const handleHugBlur = vi.fn();

    const result = getValueBlurHandlerByMode(handleFillBlur, handleBlur, handleHugBlur);

    expect(result[SizingMode.fill]).toBe(handleFillBlur);
    expect(result[SizingMode.fixed]).toBe(handleBlur);
    expect(result[SizingMode.hug]).toBe(handleHugBlur);
  });
});
