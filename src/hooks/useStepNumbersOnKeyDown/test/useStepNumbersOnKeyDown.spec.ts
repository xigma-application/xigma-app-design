import { KeyboardEvent } from 'react';

// hooks
import { useStepNumbersOnKeyDown } from '../useStepNumbersOnKeyDown';

const handleStepNumbersKeyDownMock = vi.fn();

vi.mock('../utils/handleStepNumbersKeyDown', () => ({
  handleStepNumbersKeyDown: (...args: unknown[]): void => handleStepNumbersKeyDownMock(...args),
}));

describe('useStepNumbersOnKeyDown', () => {
  beforeEach(() => {
    handleStepNumbersKeyDownMock.mockClear();
  });

  it('should forward the key event and the given options to the step handler', () => {
    // mock
    const event = { key: 'ArrowUp' } as KeyboardEvent<HTMLInputElement>;
    const options = { step: 5 };

    // before
    useStepNumbersOnKeyDown(options)(event);

    // result
    expect(handleStepNumbersKeyDownMock).toHaveBeenCalledWith(event, options);
  });

  it('should default to empty options', () => {
    // mock
    const event = { key: 'ArrowDown' } as KeyboardEvent<HTMLInputElement>;

    // before
    useStepNumbersOnKeyDown()(event);

    // result
    expect(handleStepNumbersKeyDownMock).toHaveBeenCalledWith(event, {});
  });
});
