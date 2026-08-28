// types
import { MouseButton } from 'types/enums';

// utils
import { handleMouseDown } from '../handleMouseDown';

describe('handleMouseDown', () => {
  it('should start pressing and record the inverted flag when the primary mouse button is held', () => {
    // mock
    const setIsInverted = vi.fn();
    const setIsPressing = vi.fn();
    const event = { button: MouseButton.primary } as never;

    // before
    handleMouseDown(event, true, setIsInverted, setIsPressing);

    // result
    expect(setIsInverted).toHaveBeenCalledWith(true);
    expect(setIsPressing).toHaveBeenCalledWith(true);
  });

  it('should do nothing when a non-primary mouse button is held', () => {
    // mock
    const setIsInverted = vi.fn();
    const setIsPressing = vi.fn();
    const event = { button: MouseButton.middle } as never;

    // before
    handleMouseDown(event, true, setIsInverted, setIsPressing);

    // result
    expect(setIsInverted).not.toHaveBeenCalled();
    expect(setIsPressing).not.toHaveBeenCalled();
  });
});
