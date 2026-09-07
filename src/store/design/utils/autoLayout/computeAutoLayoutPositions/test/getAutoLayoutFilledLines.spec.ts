// types
import { SizingMode } from 'types/design/enums';

// utils
import { getAutoLayoutFilledLines } from '../getAutoLayoutFilledLines';

describe('getAutoLayoutFilledLines', () => {
  it('should fill each line independently, using each line’s own thickness as the counter size', () => {
    const lines = [
      [
        { height: 0, heightSizingMode: SizingMode.fill, id: 'a', width: 30 },
        { height: 50, id: 'b', width: 20 },
      ],
      [{ height: 20, id: 'c', width: 30 }],
    ];

    const filledLines = getAutoLayoutFilledLines(true, 10, 100, SizingMode.fixed, SizingMode.fixed, lines);

    expect(filledLines).toEqual([
      [
        { height: 50, heightSizingMode: SizingMode.fill, id: 'a', width: 30 },
        { height: 50, id: 'b', width: 20 },
      ],
      [{ height: 20, id: 'c', width: 30 }],
    ]);
  });
});
